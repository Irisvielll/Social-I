
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;

import { OWNER_CONFIG } from "./src/config/adminConfig";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  // Trust proxy for express-rate-limit to work correctly behind nginx
  app.set('trust proxy', 1);

  // Security Middlewares
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for development convenience with Vite
    crossOriginEmbedderPolicy: false
  }));

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: "Too many requests from this IP, please try again later."
  });

  app.use("/api/", limiter);
  app.use(express.json({ limit: '10kb' })); // Limit body size to prevent DoS

  // Mock Database
  const state = {
    users: [] as any[],
    messages: [] as any[],
    friends: [] as any[],
    challenges: [] as any[],
    ads: OWNER_CONFIG.activeAds,
    payments: [] as any[],
    adminEmail: "admin@introvertup.com",
    adminPayoutMethod: OWNER_CONFIG.payoutDetails.method,
    adminPayoutAccount: OWNER_CONFIG.payoutDetails.accountIdentifier
  };

  // API Routes
  app.get("/api/ads", (req, res) => {
    res.json(state.ads);
  });

  app.post("/api/admin/ads", (req, res) => {
    if (!req.body || !Array.isArray(req.body.ads)) {
      return res.status(400).json({ error: "Invalid input" });
    }
    state.ads = req.body.ads;
    res.json({ success: true });
  });

  app.get("/api/admin/payments", (req, res) => {
    res.json(state.payments);
  });

  app.post("/api/payments", (req, res) => {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: "Invalid input" });
    }
    const payment = {
      ...req.body,
      id: Date.now(),
      timestamp: new Date().toISOString()
    };
    state.payments.push(payment);
    res.json({ success: true, message: "Payment received! Thank you." });
  });

  app.post("/api/create-checkout-session", async (req, res) => {
    if (!PAYMONGO_SECRET_KEY) {
      console.error("PAYMONGO_SECRET_KEY is missing from environment variables");
      return res.status(500).json({ error: "PayMongo is not configured on the server. Please add PAYMONGO_SECRET_KEY to environment variables." });
    }

    const { amount, name, description } = req.body;

    // PayMongo minimum amount is 100 centavos (1 PHP), but many methods like GCash require 2000 (20 PHP)
    // If the price is in USD (e.g. 0.99), we should convert it to a reasonable PHP amount for testing
    // Let's assume 1 USD = 56 PHP for this demo
    const phpAmount = Math.max(Math.round(amount * 56 * 100), 2000); 

    try {
      console.log(`Creating PayMongo session for ${name} - Amount: ${phpAmount} centavos`);
      
      const response = await fetch("https://api.paymongo.com/v1/checkout_sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ":").toString("base64")}`
        },
        body: JSON.stringify({
          data: {
            attributes: {
              line_items: [
                {
                  amount: phpAmount,
                  currency: "PHP",
                  name: name || "Social-I Purchase",
                  description: description || "In-app purchase",
                  quantity: 1
                }
              ],
              payment_method_types: [
                "card", 
                "gcash", 
                "paymaya", 
                "grab_pay", 
                "billease", 
                "dob", 
                "dob_ubp"
              ],
              success_url: req.body.success_url || `${req.headers.origin || 'http://localhost:3000'}/?success=true`,
              cancel_url: `${req.headers.origin || 'http://localhost:3000'}/?canceled=true`,
              description: description || "Social-I Purchase"
            }
          }
        })
      });

      const data: any = await response.json();

      if (data.errors) {
        console.error("PayMongo API Errors:", JSON.stringify(data.errors));
        return res.status(400).json({ error: data.errors[0].detail });
      }

      if (!data.data || !data.data.attributes || !data.data.attributes.checkout_url) {
        console.error("Unexpected PayMongo response:", JSON.stringify(data));
        return res.status(500).json({ error: "Failed to get checkout URL from PayMongo" });
      }

      res.json({ 
        id: data.data.id, 
        url: data.data.attributes.checkout_url 
      });
    } catch (error: any) {
      console.error("PayMongo Server Error:", error);
      res.status(500).json({ error: error.message || "Internal server error during payment creation" });
    }
  });

  // Socket.io Logic
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
    });

    socket.on("send_message", (data) => {
      // data: { toId, fromId, text, imageUrl, emoji, gifUrl }
      const msg = { ...data, id: Date.now(), timestamp: Date.now() };
      state.messages.push(msg);
      io.to(data.toId).emit("receive_message", msg);
      io.to(data.fromId).emit("receive_message", msg);
    });

    socket.on("send_challenge", (data) => {
      // data: { fromId, fromName, toId }
      const challenge = { 
        ...data, 
        id: `ch-${Date.now()}`, 
        status: 'pending',
        proposedPrompts: {}
      };
      state.challenges.push(challenge);
      io.to(data.toId).emit("challenge_received", challenge);
      io.to(data.fromId).emit("challenge_updated", challenge);

      // AI Friend Auto-Accept Logic
      if (data.toId === 'ai-friend') {
        setTimeout(() => {
          challenge.status = 'proposing';
          io.to(challenge.fromId).emit("challenge_updated", challenge);
          io.to(challenge.toId).emit("challenge_updated", challenge);
          
          // AI also proposes a mission immediately
          setTimeout(() => {
            challenge.proposedPrompts['ai-friend'] = "Ask a stranger for the time, then say 'The future is now!'";
            const participants = [challenge.fromId, challenge.toId];
            const allProposed = participants.every(p => challenge.proposedPrompts[p]);
            if (allProposed) challenge.status = 'minigame';
            io.to(challenge.fromId).emit("challenge_updated", challenge);
            io.to(challenge.toId).emit("challenge_updated", challenge);
          }, 2000);
        }, 1000);
      }
    });

    socket.on("reject_challenge", (challengeId) => {
      const challenge = state.challenges.find(c => c.id === challengeId);
      if (challenge) {
        challenge.status = 'rejected';
        io.to(challenge.fromId).emit("challenge_updated", challenge);
        io.to(challenge.toId).emit("challenge_updated", challenge);
      }
    });

    socket.on("accept_challenge", (challengeId) => {
      const challenge = state.challenges.find(c => c.id === challengeId);
      if (challenge) {
        challenge.status = 'proposing';
        io.to(challenge.fromId).emit("challenge_updated", challenge);
        io.to(challenge.toId).emit("challenge_updated", challenge);
      }
    });

    socket.on("challenge:propose", ({ challengeId, userId, prompt }) => {
      const challenge = state.challenges.find(c => c.id === challengeId);
      if (challenge && challenge.status === 'proposing') {
        challenge.proposedPrompts[userId] = prompt;
        
        // Check if both have proposed
        const participants = [challenge.fromId, challenge.toId];
        const allProposed = participants.every(p => challenge.proposedPrompts[p]);
        
        if (allProposed) {
          challenge.status = 'minigame';
        }
        
        io.to(challenge.fromId).emit("challenge_updated", challenge);
        io.to(challenge.toId).emit("challenge_updated", challenge);
      }
    });

    socket.on("challenge:minigame_win", ({ challengeId, winnerId }) => {
      const challenge = state.challenges.find(c => c.id === challengeId);
      if (challenge && challenge.status === 'minigame') {
        challenge.status = 'choosing';
        challenge.minigameWinnerId = winnerId;
        io.to(challenge.fromId).emit("challenge_updated", challenge);
        io.to(challenge.toId).emit("challenge_updated", challenge);
      }
    });

    socket.on("challenge:choose", ({ challengeId, prompt }) => {
      const challenge = state.challenges.find(c => c.id === challengeId);
      if (challenge && challenge.status === 'choosing') {
        challenge.status = 'racing';
        challenge.finalPrompt = prompt;
        challenge.startTime = Date.now();
        io.to(challenge.fromId).emit("challenge_updated", challenge);
        io.to(challenge.toId).emit("challenge_updated", challenge);
      }
    });

    socket.on("challenge:submit_proof", ({ challengeId, userId, proofUrl }) => {
      const challenge = state.challenges.find(c => c.id === challengeId);
      if (challenge && challenge.status === 'racing') {
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        
        if (now - challenge.startTime! > oneHour) {
          challenge.status = 'expired';
          // Both get 1 point logic would be handled here or on client
        } else {
          challenge.status = 'completed';
          challenge.winnerId = userId;
          challenge.proofUrl = proofUrl;
          challenge.endTime = now;
        }
        
        io.to(challenge.fromId).emit("challenge_updated", challenge);
        io.to(challenge.toId).emit("challenge_updated", challenge);
      }
    });

    socket.on("tictactoe_move", (data) => {
      // data: { toId, board, nextTurn }
      io.to(data.toId).emit("tictactoe_update", data);
    });

    socket.on("ai_broadcast", (data) => {
      // data: { text, senderName }
      const msg = { 
        ...data, 
        id: `ai-${Date.now()}`, 
        timestamp: Date.now(),
        isAi: true 
      };
      io.emit("receive_ai_broadcast", msg);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
