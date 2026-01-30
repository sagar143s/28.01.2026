import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getAuth } from "@/lib/firebase-admin";

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const data = await request.json();

    await connectDB();

    let userId = null;

    // If user is authenticated, get their ID
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const idToken = authHeader.split("Bearer ")[1];
        const decodedToken = await getAuth().verifyIdToken(idToken);
        userId = decodedToken.uid;
      } catch (error) {
        // User not authenticated, proceed with guest tracking
      }
    }

    // Fetch geolocation data from IP
    let locationData = {
      city: "Unknown",
      state: "Unknown",
      country: "Unknown",
      latitude: null,
      longitude: null,
    };

    try {
      // Use ip-api.com for geolocation (or use ipify + geolocation service)
      const ipResponse = await fetch("https://ipapi.co/json/");
      if (ipResponse.ok) {
        const geoData = await ipResponse.json();
        locationData = {
          city: geoData.city || "Unknown",
          state: geoData.region || "Unknown",
          country: geoData.country_name || "Unknown",
          latitude: geoData.latitude,
          longitude: geoData.longitude,
        };
      }
    } catch (geoError) {
      console.log("Geolocation fetch error:", geoError.message);
    }

    // Browser and device detection
    const userAgent = request.headers.get("user-agent") || "";
    const deviceType = /mobile|android|iphone|ipad/i.test(userAgent)
      ? "Mobile"
      : "Desktop";
    const browser = getBrowserInfo(userAgent);

    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "Unknown";

    const trackingData = {
      timestamp: new Date(),
      ip: clientIp,
      city: locationData.city,
      state: locationData.state,
      country: locationData.country,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      deviceType,
      browser,
      userAgent: userAgent.substring(0, 200),
      pageUrl: data.pageUrl || "/",
    };

    // If user is authenticated, save to their profile
    if (userId) {
      let user = await User.findById(userId);

      if (!user) {
        user = await User.create({
          _id: userId,
          locations: [trackingData],
          lastLocation: {
            city: locationData.city,
            state: locationData.state,
            country: locationData.country,
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            timestamp: new Date(),
          },
          firstVisitLocation: {
            city: locationData.city,
            state: locationData.state,
            country: locationData.country,
            timestamp: new Date(),
          },
        });
      } else {
        // Update existing user
        if (!user.locations) user.locations = [];
        user.locations.push(trackingData);

        // Keep only last 100 location records
        if (user.locations.length > 100) {
          user.locations = user.locations.slice(-100);
        }

        user.lastLocation = {
          city: locationData.city,
          state: locationData.state,
          country: locationData.country,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          timestamp: new Date(),
        };

        await user.save();
      }
    }

    return NextResponse.json({
      success: true,
      message: "Location tracked successfully",
      location: trackingData,
      userId: userId || null,
    });
  } catch (error) {
    console.error("Location tracking error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

function getBrowserInfo(userAgent) {
  if (/Chrome/.test(userAgent)) return "Chrome";
  if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) return "Safari";
  if (/Firefox/.test(userAgent)) return "Firefox";
  if (/Edge|Edg/.test(userAgent)) return "Edge";
  if (/Opera/.test(userAgent)) return "Opera";
  return "Other";
}
