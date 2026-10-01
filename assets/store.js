// Хранилище заявок.
// Сейчас: localStorage (данные видны только в этом браузере — для демонстрации).
// Для работы с реальными клиентами замените эти функции на запросы к серверу
// (например, Supabase) — интерфейс Store останется тем же.
window.STATUSES = {
  new:       { label:"Заявка получена",        tone:"idle" },
  review:    { label:"Проверяем документы",    tone:"warn" },
  submitted: { label:"Подана на визу",         tone:"warn" },
  approved:  { label:"Виза одобрена",          tone:"ok"   },
  fix:       { label:"Нужны исправления",      tone:"err"  }
};
window.Store = {
  KEY: "ast_applications_v1",
  all(){ try { return JSON.parse(localStorage.getItem(this.KEY)) || []; } catch(e){ return []; } },
  _save(list){ try { localStorage.setItem(this.KEY, JSON.stringify(list)); return true; } catch(e){ return false; } },
  add(app){
    const list = this.all();
    const now = new Date().toISOString();
    const rec = Object.assign({}, app, {
      id: "AST-" + Math.random().toString(36).slice(2,8).toUpperCase(),
      created: now, status: "new", note: "", history: [{ status:"new", at: now }]
    });
    list.unshift(rec); this._save(list); return rec;
  },
  update(id, patch){
    const list = this.all(); const i = list.findIndex(a => a.id === id); if(i < 0) return null;
    const rec = list[i];
    if(patch.status && patch.status !== rec.status) rec.history.push({ status: patch.status, at: new Date().toISOString() });
    Object.assign(rec, patch); this._save(list); return rec;
  },
  remove(id){ this._save(this.all().filter(a => a.id !== id)); },
  find(id, phone){
    const norm = s => String(s||"").replace(/\D/g,"").slice(-10);
    return this.all().find(a => a.id.toUpperCase() === String(id).trim().toUpperCase() &&
      (!phone || norm(a.trip && a.trip.phone) === norm(phone)));
  }
};
