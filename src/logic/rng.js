/* ============================================================
   RNG — gerador aleatório com seed serializável (mulberry32).
   Por que com seed? Pra salvar o jogo e ter o mesmo "destino"
   ao carregar — o save guarda só o estado atual (um inteiro).
   ============================================================ */

export function createRng(initialState) {
  let state = (initialState >>> 0) || 1;

  function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  return {
    next,
    range: (min, max) => min + Math.floor(next() * (max - min + 1)),
    chance: (p) => next() < p,
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    getState: () => state,
    setState: (s) => {
      state = (s >>> 0) || 1;
    },
  };
}

export function newSeed() {
  return Math.floor(Math.random() * 4294967295) + 1;
}
