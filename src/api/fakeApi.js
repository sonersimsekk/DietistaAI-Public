// src/api/fakeApi.js

const LS_USERS = "dietista_users";
const LS_CURRENT = "dietista_current_user_id";

function readUsers() {
  try {
    const raw = localStorage.getItem(LS_USERS);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function writeUsers(users) {
  try {
    localStorage.setItem(LS_USERS, JSON.stringify(users));
  } catch (e) {}
}

function ensureSeed() {
  const users = readUsers();
  if (users.length > 0) return users;

  const seedUser = {
    id: "u_seed_soner",
    name: "Soner",
    surname: "Şimşek",
    age: 17,
    gender: "Erkek",
    height: 175,
    weight: 70,
    activityLevel: "Düşük",
    goal: "Kas Kütlesi Arttırma ve Yağ Yakımı",
    neededCalories: 2100,
    diseases: "Gluten intoleransı",
    allergies: "Yok",
    dailyWaterIntake: 2.5,
    macros: { protein: 150, carbs: 230, fat: 45 }
  };

  writeUsers([seedUser]);
  // ✅ ÖNEMLİ: burada current set etmiyoruz (kullanıcı Start’ta seçecek)
  return [seedUser];
}

export function getUsers() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(ensureSeed()), 250);
  });
}

export function createUser(user) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = ensureSeed();

      const id = "u_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
      const newUser = {
        id,
        name: (user?.name || "Kullanıcı").trim(),
        surname: (user?.surname || "").trim(),
        age: Number(user?.age || 25),
        gender: user?.gender || "Belirtilmedi",
        height: Number(user?.height || 170),
        weight: Number(user?.weight || 70),
        activityLevel: user?.activityLevel || "Orta",
        goal: user?.goal || "Form ve Sağlık",
        neededCalories: Number(user?.neededCalories || 2100),
        diseases: user?.diseases || "Yok",
        allergies: user?.allergies || "Yok",
        dailyWaterIntake: Number(user?.dailyWaterIntake || 2.0),
        macros: {
          protein: Number(user?.macros?.protein || 120),
          carbs: Number(user?.macros?.carbs || 220),
          fat: Number(user?.macros?.fat || 60)
        }
      };

      users.push(newUser);
      writeUsers(users);

      // ✅ oluşturunca current seç
      try { localStorage.setItem(LS_CURRENT, id); } catch (e) {}

      resolve(newUser);
    }, 300);
  });
}

export function deleteUser(userId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = ensureSeed().filter(u => u.id !== userId);
      writeUsers(users);

      const current = localStorage.getItem(LS_CURRENT);
      if (current === userId) {
        localStorage.removeItem(LS_CURRENT);
      }
      resolve(true);
    }, 250);
  });
}

export function setCurrentUserId(userId) {
  try {
    if (!userId) localStorage.removeItem(LS_CURRENT);
    else localStorage.setItem(LS_CURRENT, String(userId));
  } catch (e) {}
}

export function getCurrentUserId() {
  try {
    return localStorage.getItem(LS_CURRENT) || "";
  } catch (e) {
    return "";
  }
}

// ✅ Kritik: current yoksa fallback yok → null döner
export function getCurrentUserSync() {
  const users = ensureSeed();
  const currentId = getCurrentUserId();
  if (!currentId) return null;
  const found = users.find(u => u.id === currentId);
  return found || null;
}

// ✅ AI ve uygulama burayı kullanacak: current yoksa null döner
export function getUserData() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(getCurrentUserSync()), 250);
  });
}
