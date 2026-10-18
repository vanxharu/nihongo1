import { auth } from '../lib/firebase';
import type { User } from 'firebase/auth';
import type { SavedPdfExam } from './pdfStorage';

const SESSION_CHANGED = 'Tài khoản đã thay đổi. Hãy mở lại thư viện PDF.';

// One operation belongs to its initiating user, including every upload/download part.
function assertOwner(user: User) {
  if (auth.currentUser?.uid !== user.uid) throw new Error(SESSION_CHANGED);
}

function currentOwner(expectedUid?: string): User | null {
  const user = auth.currentUser;
  if (expectedUid && user?.uid !== expectedUid) throw new Error(SESSION_CHANGED);
  return user;
}

async function request(user: User, path: string, body?: unknown) {
  assertOwner(user);
  const token = await user.getIdToken();
  assertOwner(user);
  const response = await fetch(path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });
  assertOwner(user);
  if (!response.ok) throw new Error('Không đồng bộ được PDF với Firebase. Bản trên máy vẫn được giữ.');
  return response;
}

export async function uploadCloudPdf(record: SavedPdfExam) {
  const user = currentOwner(record.ownerUid);
  if (!user) return;
  const generation = crypto.randomUUID();
  const data = record.fileDataUrl;
  const count = Math.ceil(data.length / 200000);
  const { fileDataUrl, ...metadata } = record;
  const send = (body: unknown) => request(user, '/api/user/files', body);
  await send({ action: 'begin', id: record.id, generation, count, totalLength: data.length, metadata });
  for (let index = 0; index < count; index++) {
    await send({ action: 'part', id: record.id, generation, index, data: data.slice(index * 200000, (index + 1) * 200000) });
  }
  await send({ action: 'commit', id: record.id, generation });
}

export async function cloudPdfMetadata(expectedUid?: string): Promise<SavedPdfExam[]> {
  const user = currentOwner(expectedUid);
  if (!user) return [];
  const response = await request(user, '/api/user/files');
  const packet = await response.json();
  assertOwner(user);
  return packet.files || [];
}

export async function downloadCloudPdf(record: SavedPdfExam, expectedUid?: string) {
  const user = currentOwner(expectedUid || record.ownerUid);
  if (!user) throw new Error('Cần đăng nhập.');
  const chunks: string[] = [];
  let count = 1;
  for (let index = 0; index < count; index++) {
    const response = await request(user, `/api/user/files/part?id=${encodeURIComponent(record.id)}&index=${index}`);
    const part = await response.json();
    assertOwner(user);
    count = part.count;
    chunks.push(part.data);
  }
  return { ...record, ownerUid: user.uid, fileDataUrl: chunks.join('') };
}

export async function deleteCloudPdf(id: string, expectedUid?: string) {
  const user = currentOwner(expectedUid);
  if (user) await request(user, '/api/user/files', { action: 'delete', id });
}
