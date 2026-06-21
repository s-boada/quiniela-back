import { HttpError } from "../lib/http-error";
import { toApiUser } from "../lib/mappers";
import { generatePassword, hashPassword } from "./auth.service";
import { userRepository } from "../repositories/user.repository";
import { predictionRepository } from "../repositories/prediction.repository";

export async function listUsers() {
  const users = await userRepository.findAll();
  return users.map(toApiUser);
}

export async function createUser(payload: {
  id?: string;
  displayName?: string;
  role?: string;
  avatar?: string;
  password?: string;
}) {
  const id = (payload.id || "").trim().toLowerCase();
  const displayName = (payload.displayName || "").trim();
  const role = (payload.role || "user").trim().toLowerCase();
  const avatar = payload.avatar || "⚽";
  let password = payload.password;

  if (!id || !displayName) throw new HttpError(400, "id y displayName son requeridos");
  if (role !== "admin" && role !== "user") throw new HttpError(400, "Rol inválido");
  if (await userRepository.findById(id)) throw new HttpError(409, "El usuario ya existe");

  if (!password) password = generatePassword();

  const user = await userRepository.create({
    id,
    passwordHash: hashPassword(password),
    displayName,
    role,
    avatar
  });

  return { user: toApiUser(user), password };
}

export async function updateUser(id: string, payload: { displayName?: string; role?: string; avatar?: string }) {
  const target = await userRepository.findById(id);
  if (!target) throw new HttpError(404, "Usuario no encontrado");

  const displayName = (payload.displayName ?? target.displayName).trim();
  const role = (payload.role ?? target.role).trim().toLowerCase();
  const avatar = payload.avatar ?? target.avatar;

  if (!displayName) throw new HttpError(400, "El nombre no puede estar vacío");
  if (role !== "admin" && role !== "user") throw new HttpError(400, "Rol inválido");

  const updated = await userRepository.update(id, { displayName, role, avatar });
  return { user: toApiUser(updated) };
}

export async function resetUserPassword(id: string, passwordInput?: string) {
  if (!await userRepository.findById(id)) throw new HttpError(404, "Usuario no encontrado");
  const password = passwordInput || generatePassword();
  await userRepository.update(id, { passwordHash: hashPassword(password) });
  return { password };
}

export async function deleteUser(id: string, requestUserId: string) {
  if (id === requestUserId) throw new HttpError(400, "No puedes eliminar tu propia cuenta");
  if (!await userRepository.findById(id)) throw new HttpError(404, "Usuario no encontrado");

  await predictionRepository.deleteByUserId(id);
  await userRepository.delete(id);
  return { ok: true };
}
