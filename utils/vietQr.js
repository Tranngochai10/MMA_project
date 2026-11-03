const ApiError = require('./ApiError');

function field(id, value) {
  const text = String(value);
  if (Buffer.byteLength(text) > 99) throw new ApiError(400, 'QR field is too long.');
  return id + String(Buffer.byteLength(text)).padStart(2, '0') + text;
}
function crc16(text) {
  let crc = 0xffff;
  for (const byte of Buffer.from(text)) {
    crc ^= byte << 8;
    for (let i = 0; i < 8; i++) crc = ((crc << 1) ^ ((crc & 0x8000) ? 0x1021 : 0)) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}
function vietQr({ bankBin, accountNumber, amount, reference }) {
  if (!/^\d{6}$/.test(bankBin) || !/^\d{6,25}$/.test(accountNumber) ||
      !Number.isSafeInteger(amount) || amount <= 0 || amount > 9999999999999 ||
      !/^[a-zA-Z0-9 ]{1,25}$/.test(reference)) throw new ApiError(400, 'Invalid bank transfer details.');
  const merchant = field('00', 'A000000727') + field('01', field('00', bankBin) + field('01', accountNumber)) + field('02', 'QRIBFTTA');
  const payload = field('00', '01') + field('01', '12') + field('38', merchant) + field('53', '704') +
    field('54', amount) + field('58', 'VN') + field('62', field('08', reference)) + '6304';
  return payload + crc16(payload);
}
module.exports = { vietQr, crc16 };
