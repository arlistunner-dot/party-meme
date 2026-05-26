/**
 * Boshlang'ich karta to'plami (offline/mock uchun)
 * Serverdan yuklangunga qadar ishlatiladi
 */

export interface StaticCard {
  id: number;
  type: 'red' | 'blue';
  text: string;
  deckId: string;
}

// ---- QIZIL KARTALAR (Savollar) ----

export const RED_CARDS: StaticCard[] = [
  { id: 1, type: 'red', text: 'Agar internet bir kun ishlamasa...', deckId: 'standard' },
  { id: 2, type: 'red', text: 'O\'qituvchi aytgan eng kulgli gap:', deckId: 'standard' },
  { id: 3, type: 'red', text: 'Ota-onam meni kompyuter o\'ynayotganimda ko\'rsa...', deckId: 'standard' },
  { id: 4, type: 'red', text: 'Do\'stim menga ishonib aytgan siri:', deckId: 'standard' },
  { id: 5, type: 'red', text: 'Birinchi ish kuni haqida:', deckId: 'standard' },
  { id: 6, type: 'red', text: 'Oshxonada eng yomon taom:', deckId: 'standard' },
  { id: 7, type: 'red', text: 'Kechki soat 3 da men:', deckId: 'standard' },
  { id: 8, type: 'red', text: 'Yangi yil arafasida oilam bilan:', deckId: 'standard' },
  { id: 9, type: 'red', text: 'Imtihondan oldingi oxirgi daqiqalar:', deckId: 'standard' },
  { id: 10, type: 'red', text: 'Supermarketga "faqat 1 narsa" olish uchun kirib:', deckId: 'standard' },
  { id: 11, type: 'red', text: 'Bugun nima qilishni rejalashtirgandim vs nima qildim:', deckId: 'standard' },
  { id: 12, type: 'red', text: 'Telefonim 1% da bo\'lsa:', deckId: 'standard' },
  { id: 13, type: 'red', text: 'Poyezdda yonimga o\'tirgan odam:', deckId: 'standard' },
  { id: 14, type: 'red', text: 'Uyga mehmongacha kelganida:', deckId: 'standard' },
  { id: 15, type: 'red', text: 'Eng yomon maslahat:', deckId: 'standard' },
];

// ---- KO'K KARTALAR (Javoblar) ----

export const BLUE_CARDS: StaticCard[] = [
  { id: 101, type: 'blue', text: 'Men kitob o\'qiyman deb yolg\'on qilaman', deckId: 'standard' },
  { id: 102, type: 'blue', text: 'Barcha do\'stlarim real hayotda meni tanimasa egni qoladi', deckId: 'standard' },
  { id: 103, type: 'blue', text: 'Ota-onam: Sen doim telefonda deb ko\'rsanadi', deckId: 'standard' },
  { id: 104, type: 'blue', text: 'Oh no... anyway', deckId: 'standard' },
  { id: 105, type: 'blue', text: 'Google menga javob bermay qo\'yadi', deckId: 'standard' },
  { id: 106, type: 'blue', text: 'WiFi yo\'qolganida qo\'rquv', deckId: 'standard' },
  { id: 107, type: 'blue', text: 'Oshpazlikdagi dahshatli tajribam', deckId: 'standard' },
  { id: 108, type: 'blue', text: 'Yostiqqa yuzimni bosib baqiraman', deckId: 'standard' },
  { id: 109, type: 'blue', text: 'Qo\'shnining musiqasi soat 6 da', deckId: 'standard' },
  { id: 110, type: 'blue', text: 'Kredit karta hisobimni ko\'rganimda', deckId: 'standard' },
  { id: 111, type: 'blue', text: 'Uxlab qolib darsga kechikkanim', deckId: 'standard' },
  { id: 112, type: 'blue', text: 'Barcha narsaga "yaxshi" deb javob beraman', deckId: 'standard' },
  { id: 113, type: 'blue', text: 'YouTube qorong\'u tomoniga tushib qoldim', deckId: 'standard' },
  { id: 114, type: 'blue', text: 'Sport zalga borganim (1 kun)', deckId: 'standard' },
  { id: 115, type: 'blue', text: 'Menga "sen o\'zgarmaysan" deyishganida', deckId: 'standard' },
  { id: 116, type: 'blue', text: 'Nima bo\'lganini tushuntira olmayman', deckId: 'standard' },
  { id: 117, type: 'blue', text: 'Yolg\'izlik men uchun dam olish', deckId: 'standard' },
  { id: 118, type: 'blue', text: 'Telegram kanalimga 1 ta obuna', deckId: 'standard' },
  { id: 119, type: 'blue', text: 'Nonushtasiz uydan chiqqanim', deckId: 'standard' },
  { id: 120, type: 'blue', text: 'Barchaga "menga farqi yo\'q" deb o\'zimni ko\'rsataman', deckId: 'standard' },
];

// ---- TO'PLAMLAR BO'YICHA ----

export const CARDS_BY_DECK: Record<string, StaticCard[]> = {
  standard: [...RED_CARDS, ...BLUE_CARDS],
};

/**
 * Tasodifiy karta oladi
 */
export function getRandomCard(type: 'red' | 'blue', deckId = 'standard'): StaticCard {
  const pool = type === 'red' ? RED_CARDS : BLUE_CARDS;
  const filtered = pool.filter((c) => c.deckId === deckId);
  return filtered[Math.floor(Math.random() * filtered.length)];
}

/**
 * Tasodifiy qo'l kartalarini oladi (o'yin boshida)
 */
export function getStartingHand(count: number, deckId = 'standard'): StaticCard[] {
  const pool = BLUE_CARDS.filter((c) => c.deckId === deckId);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
