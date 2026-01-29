import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Wallet from "@/models/Wallet";
import { getAuth } from "@/lib/firebase-admin";

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    await connectDB();
    let wallet = await Wallet.findOne({ userId }).lean();

    if (!wallet) {
      wallet = await Wallet.create({ userId, coins: 0 });
    }

    const coins = Number(wallet.coins || 0);
    const rupeesValue = Number((coins * 0.5).toFixed(2));

    return NextResponse.json({
      coins,
      rupeesValue,
      transactions: wallet.transactions || []
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
