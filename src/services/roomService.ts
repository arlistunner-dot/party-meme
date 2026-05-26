import { api } from './api';
import { API_ENDPOINTS } from '@/config/api';
import type { Room, CreateRoomRequest, JoinRoomRequest } from '@/types/room';

/**
 * Xona yaratish
 */
export async function createRoom(data: CreateRoomRequest): Promise<Room> {
  return api.post<Room>(API_ENDPOINTS.ROOMS, data);
}

/**
 * Xona ma'lumotlari
 */
export async function getRoom(roomCode: string): Promise<Room> {
  return api.get<Room>(`${API_ENDPOINTS.ROOMS}/${roomCode}`);
}

/**
 * Xonaga qo'shilish
 */
export async function joinRoom(data: JoinRoomRequest): Promise<Room> {
  return api.post<Room>(`${API_ENDPOINTS.ROOMS}/${data.roomCode}/join`);
}

/**
 * Xonadan chiqish
 */
export async function leaveRoom(roomCode: string): Promise<void> {
  return api.post(`${API_ENDPOINTS.ROOMS}/${roomCode}/leave`);
}

/**
 * Tayyor holat
 */
export async function setReady(roomCode: string): Promise<void> {
  return api.post(`${API_ENDPOINTS.ROOMS}/${roomCode}/ready`);
}
