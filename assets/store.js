// Хранилище заявок — Supabase (схема и права: supabase/migrations).
// Клиент может только отправить заявку и узнать её статус по номеру + телефону.
// Видеть и менять все заявки может только менеджер (вход по email и паролю).
const STATUS_TONES = { new:"idle", review:"warn", submitted:"warn", approved:"ok", fix:"err" };
window.STATUSES = {};
Object.keys(STATUS_TONES).forEach(k => Object.defineProperty(STATUSES, k, {
  enumerable: true, value: { tone: STATUS_TONES[k], get label(){ return t("st." + k); } }
}));
window.Store = (function(){
  const S = window.SITE || {};
  const db = window.supabase.createClient(S.supabaseUrl, S.supabaseKey);
  const MINE = "ast_mine_v1";   // номера заявок, отправленных с этого устройства
  const fail = (error, what) => { if(error){ console.error(what, error); throw new Error(what); } };
  const mine = () => { try { return JSON.parse(localStorage.getItem(MINE)) || []; } catch(e){ return []; } };
  const remember = (id, phone) => {
    try { localStorage.setItem(MINE, JSON.stringify([{ id, phone }, ...mine().filter(m => m.id !== id)].slice(0, 20))); } catch(e){}
  };
  return {
    // клиент
    async add(app){
      const { data, error } = await db.rpc("submit_application", { p_trip: app.trip, p_travellers: app.travellers });
      fail(error, "Не удалось отправить заявку");
      remember(data, app.trip.phone);
      return { id: data };
    },
    async find(id, phone){
      const { data, error } = await db.rpc("find_application", { p_id: String(id || "").trim(), p_phone: String(phone || "") });
      fail(error, "Не удалось проверить статус");
      return data || null;
    },
    mine,
    // менеджер
    async all(){
      const { data, error } = await db.from("applications").select("*").order("created", { ascending:false });
      fail(error, "Не удалось загрузить заявки");
      return data;
    },
    async update(id, patch){
      const { data, error } = await db.from("applications").update(patch).eq("id", id).select().single();
      fail(error, "Не удалось сохранить");
      return data;
    },
    async remove(id){
      const { error } = await db.from("applications").delete().eq("id", id);
      fail(error, "Не удалось удалить заявку");
    },
    auth: {
      async session(){ const { data } = await db.auth.getSession(); return data.session; },
      async signIn(email, password){
        const { error } = await db.auth.signInWithPassword({ email, password });
        fail(error, "Неверный email или пароль");
      },
      async signOut(){ await db.auth.signOut(); },
      async isManager(){
        const { data, error } = await db.rpc("is_manager");
        fail(error, "Не удалось проверить доступ");
        return data === true;
      },
      onChange(cb){ db.auth.onAuthStateChange(() => cb()); }
    }
  };
})();
