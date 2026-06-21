import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { toApiUser } from "../lib/mappers";
import { HttpError } from "../lib/http-error";
import { EMAIL_REGEX, NAME_REGEX, PASSWORD_REGEX, USERNAME_REGEX, DOCUMENT_REGEX } from "../lib/constants";
import { userRepository } from "../repositories/user.repository";

const JWT_EXPIRES = "7d";

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function generatePassword(length = 10): string {
  const chars = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

export function signToken(user: { id: string; role: string }): string {
  return jwt.sign({ sub: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export function verifyToken(token: string): jwt.JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
}

export async function login(usernameRaw: string, password: string) {
  const username = usernameRaw.trim().toLowerCase();
  if (!username || !password) throw new HttpError(400, "Usuario y contraseña requeridos");

  const dbUser = await userRepository.findById(username);
  if (!dbUser || !verifyPassword(password, dbUser.passwordHash)) {
    throw new HttpError(401, "Credenciales inválidas");
  }

  const user = toApiUser(dbUser);
  const token = signToken(user);
  return { token, user };
}

export async function register(input: {
  firstName: string;
  lastName: string;
  documentId: string;
  email: string;
  username: string;
  password: string;
}) {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const documentId = input.documentId.trim();
  const email = input.email.trim().toLowerCase();
  const username = input.username.trim().toLowerCase();
  const password = input.password;

  if (!firstName || !lastName || !documentId || !email || !username || !password) {
    throw new HttpError(400, "Todos los campos son requeridos");
  }
  if (!NAME_REGEX.test(firstName) || !NAME_REGEX.test(lastName)) {
    throw new HttpError(400, "Nombre y apellido solo permiten letras y espacios");
  }
  if (!DOCUMENT_REGEX.test(documentId)) {
    throw new HttpError(400, "La cédula de identidad debe ser alfanumérica");
  }
  if (!EMAIL_REGEX.test(email)) {
    throw new HttpError(400, "Correo electrónico inválido");
  }
  if (!USERNAME_REGEX.test(username)) {
    throw new HttpError(400, "El usuario solo permite letras, números y guion bajo (_)");
  }
  if (!PASSWORD_REGEX.test(password)) {
    throw new HttpError(400, "La contraseña debe tener entre 8 y 12 caracteres, una mayúscula y un carácter especial");
  }
  if (await userRepository.findById(username)) {
    throw new HttpError(409, "El usuario ya existe");
  }
  if (await userRepository.findByEmail(email)) {
    throw new HttpError(409, "El correo ya está registrado");
  }

  const dbUser = await userRepository.create({
    id: username,
    passwordHash: hashPassword(password),
    displayName: `${firstName} ${lastName}`.trim(),
    firstName,
    lastName,
    documentId,
    email,
    role: "user",
    avatar: "⚽"
  });

  const user = toApiUser(dbUser);
  return { token: signToken(user), user };
}
