import { NextResponse } from "next/server";
import { friendsAuth } from "@/lib/friends";
import { fail } from "@/lib/server";

const MAX_PENDING = 20; // pedidos enviados em aberto, para evitar spam

export async function GET(req: Request) {
  const a = await friendsAuth(req);
  if ("error" in a) return a.error;
  const { db, user } = a;
  const { data } = await db.from("friendships").select("id,requester,addressee,status").or(`requester.eq.${user.id},addressee.eq.${user.id}`);
  const rows = data ?? [];
  const others = rows.map((f: any) => (f.requester === user.id ? f.addressee : f.requester));
  const { data: profs } = others.length ? await db.from("profiles").select("user_id,handle").in("user_id", others) : { data: [] };
  const handle = new Map((profs ?? []).map((p: any) => [p.user_id, p.handle]));
  const item = (f: any) => ({ id: f.id, handle: handle.get(f.requester === user.id ? f.addressee : f.requester) ?? "?" });
  return NextResponse.json({
    me: a.profile.handle,
    friends: rows.filter((f: any) => f.status === "accepted").map(item),
    incoming: rows.filter((f: any) => f.status === "pending" && f.addressee === user.id).map(item),
    outgoing: rows.filter((f: any) => f.status === "pending" && f.requester === user.id).map(item),
  });
}

/** action: request (handle) | accept | decline | cancel | remove (id) */
export async function POST(req: Request) {
  const a = await friendsAuth(req);
  if ("error" in a) return a.error;
  const { db, user } = a;
  const body = await req.json().catch(() => ({}));
  const id = String(body.id ?? "");

  switch (body.action) {
    case "request": {
      const h = String(body.handle ?? "").trim().toLowerCase().replace(/^@/, "");
      if (!/^[a-z0-9_]{3,20}$/.test(h)) return fail("Digite um @ válido");
      const { data: target } = await db.from("profiles").select("user_id").eq("handle", h).maybeSingle();
      if (!target) return fail("Não encontramos ninguém com esse @");
      if (target.user_id === user.id) return fail("Esse é o seu próprio @");
      const { data: ex } = await db.from("friendships").select("id,requester,status")
        .or(`and(requester.eq.${user.id},addressee.eq.${target.user_id}),and(requester.eq.${target.user_id},addressee.eq.${user.id})`).maybeSingle();
      if (ex) {
        if (ex.status === "accepted") return fail("Vocês já são amigos");
        if (ex.requester === user.id) return fail("Você já enviou um pedido para essa pessoa");
        await db.from("friendships").update({ status: "accepted" }).eq("id", ex.id); // a outra pessoa já tinha pedido: vira amizade
        return NextResponse.json({ ok: true, accepted: true });
      }
      const { count } = await db.from("friendships").select("id", { count: "exact", head: true }).eq("requester", user.id).eq("status", "pending");
      if ((count ?? 0) >= MAX_PENDING) return fail("Você tem muitos pedidos em aberto. Aguarde as respostas.");
      const { error } = await db.from("friendships").insert({ requester: user.id, addressee: target.user_id });
      return error ? fail("Não foi possível enviar o pedido", 500) : NextResponse.json({ ok: true });
    }
    case "accept": {
      const { data } = await db.from("friendships").update({ status: "accepted" }).eq("id", id).eq("addressee", user.id).eq("status", "pending").select("id");
      return data?.length ? NextResponse.json({ ok: true }) : fail("Pedido não encontrado", 404);
    }
    case "decline": {
      await db.from("friendships").delete().eq("id", id).eq("addressee", user.id).eq("status", "pending");
      return NextResponse.json({ ok: true });
    }
    case "cancel": {
      await db.from("friendships").delete().eq("id", id).eq("requester", user.id).eq("status", "pending");
      return NextResponse.json({ ok: true });
    }
    case "remove": {
      await db.from("friendships").delete().eq("id", id).eq("status", "accepted").or(`requester.eq.${user.id},addressee.eq.${user.id}`);
      return NextResponse.json({ ok: true });
    }
    default:
      return fail("Ação inválida");
  }
}
