import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as userRepo from '../repositories/userRepo.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { fail, ok } from '../utils/respond.js';
import { clean, isEmail } from '../utils/validation.js';

const publicUser = user => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role
});

const sign = user =>
  jwt.sign(
    {
      id: user.id,
      role: user.role
    },
    process.env.JWT_SECRET || 'dev-secret-change-me',
    {
      expiresIn: '7d'
    }
  );

/*
|--------------------------------------------------------------------------
| REGISTER
|--------------------------------------------------------------------------
*/

export const register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    phone,
    password
  } = req.body;

  if (
    !name ||
    !isEmail(email) ||
    !password ||
    password.length < 8
  ) {
    return fail(
      res,
      'Provide name, valid email and an 8+ character password'
    );
  }

  if (await userRepo.findByEmail(email)) {
    return fail(
      res,
      'Email is already registered',
      409
    );
  }

  const user = await userRepo.create({
    name: clean(name),
    email: email.toLowerCase(),
    phone: clean(phone),
    passwordHash: await bcrypt.hash(password, 10)
  });

  return ok(
    res,
    {
      user: publicUser(user),
      token: sign(user)
    },
    201
  );
});

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

export const login = asyncHandler(async (req, res) => {
  const {
    email,
    password
  } = req.body;

  const user = await userRepo.findByEmail(
    String(email || '')
  );

  if (
    !user ||
    !(await bcrypt.compare(
      password || '',
      user.passwordHash
    ))
  ) {
    return fail(
      res,
      'Invalid email or password',
      401
    );
  }

  return ok(
    res,
    {
      user: publicUser(user),
      token: sign(user)
    }
  );
});

/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/

export function logout(req, res) {
  return ok(res, {
    message: 'Logged out'
  });
}

/*
|--------------------------------------------------------------------------
| CURRENT USER
|--------------------------------------------------------------------------
*/

export function me(req, res) {
  return ok(
    res,
    publicUser(req.user)
  );
}

/*
|--------------------------------------------------------------------------
| CHANGE PASSWORD
|--------------------------------------------------------------------------
*/

export const changePassword = asyncHandler(
  async (req, res) => {

    const {
      currentPassword,
      newPassword
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | Check login
    |--------------------------------------------------------------------------
    */

    if (!req.user) {
      return fail(
        res,
        'Authentication required',
        401
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Check required fields
    |--------------------------------------------------------------------------
    */

    if (
      !currentPassword ||
      !newPassword
    ) {
      return fail(
        res,
        'Current password and new password are required'
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Check new password length
    |--------------------------------------------------------------------------
    */

    if (newPassword.length < 8) {
      return fail(
        res,
        'New password must be at least 8 characters'
      );
    }

    if (newPassword.length > 128) {
      return fail(
        res,
        'New password cannot exceed 128 characters'
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Get latest user information
    |--------------------------------------------------------------------------
    */

    const user = await userRepo.findById(
      req.user.id
    );

    if (!user) {
      return fail(
        res,
        'User not found',
        404
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Check current password
    |--------------------------------------------------------------------------
    */

    const currentPasswordCorrect =
      await bcrypt.compare(
        currentPassword,
        user.passwordHash
      );

    if (!currentPasswordCorrect) {
      return fail(
        res,
        'Current password is incorrect'
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Prevent same password
    |--------------------------------------------------------------------------
    */

    const samePassword =
      await bcrypt.compare(
        newPassword,
        user.passwordHash
      );

    if (samePassword) {
      return fail(
        res,
        'New password must be different from current password'
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Create new secure password hash
    |--------------------------------------------------------------------------
    */

    const newPasswordHash =
      await bcrypt.hash(
        newPassword,
        10
      );

    /*
    |--------------------------------------------------------------------------
    | Update database / demo user
    |--------------------------------------------------------------------------
    */

    await userRepo.updatePassword(
      user.id,
      newPasswordHash
    );

    /*
    |--------------------------------------------------------------------------
    | Success
    |--------------------------------------------------------------------------
    */

    return ok(res, {
      message: 'Password changed successfully'
    });
  }
);