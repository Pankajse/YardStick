import express, { type Request, type Response } from 'express';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prisma } from "./lib/prisma.js"
import { config } from './lib/config.js';
import { authMiddleware } from './middleware/auth.js';


const router = express.Router();


router.post("/tenant", async (req: Request, res: Response) => {
    const { name, slug } = req.body;
    if (!name || !slug) {
        return res.status(400).json({ message: "Name and slug required" });
    }

    const tenant = await prisma.tenant.create({ data: { name, slug, plan: "FREE" } });
    return res.status(200).json({ tenantId: tenant.id, name: tenant.name, slug: tenant.slug });
});

// routes.ts (Users route) — require auth and ADMIN
router.post("/users", authMiddleware, async (req: Request, res: Response) => {
  const authUser = req.user;
  if (!authUser) return res.status(401).json({ message: "Unauthorized" });
  if (authUser.role !== "ADMIN")
    return res.status(403).json({ message: "Only Admin can invite users" });

  const { email, password, role, tenantSlug } = req.body;

  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant) return res.status(404).json({ message: "Tenant not found" });

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      role,
      tenantId: tenant.id,
    },
  });

  res.json({ id: user.id, email: user.email, role: user.role, tenant: tenant.slug });
});




router.post("/auth/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ message: "Email and password required" });

    const user = await prisma.user.findUnique({ where: { email }, include: { tenant: true } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
        {
            userId: user.id,
            tenantId: user.tenantId,
            role: user.role,
            tenantSlug: user.tenant.slug,
        },
        config.JWT_SECRET,
        { expiresIn: "1h" }
    );

    res.json({ token });
});


router.post("/tenants/:slug/upgrade", authMiddleware, async (req: Request, res: Response) => {
    const { slug } = req.params;
    if (!slug) return res.status(401).json({ message: "Slug required" });
    const authUser = req.user;

    if (!authUser) return res.status(401).json({ message: "Unauthorized" });
    if (authUser.role !== "ADMIN")
        return res.status(403).json({ message: "Only Admin can upgrade plan" });

    const tenant = await prisma.tenant.update({
        where: { slug },
        data: { plan: "PRO" },
    });

    res.json({ message: "Tenant upgraded to PRO", tenant });
});


router.post("/notes", authMiddleware, async (req: Request, res: Response) => {
    const authUser = req.user;
    if (!authUser) return res.status(401).json({ message: "Unauthorized" });

    const { title, content } = req.body;
    const tenant = await prisma.tenant.findUnique({ where: { id: authUser.tenantId } });

    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    if (tenant.plan === "FREE") {
        const count = await prisma.note.count({ where: { tenantId: tenant.id } });
        if (count >= 3) {
            return res.status(403).json({ message: "Free plan allows max 3 notes. Upgrade to Pro." });
        }
    }
    const note = await prisma.note.create({
        data: {
            title,
            content,
            tenantId: authUser.tenantId,
            createdBy: authUser.userId,
        },
    });

    res.json(note);
});

router.get("/notes", authMiddleware, async (req: Request, res: Response) => {
    const authUser = req.user;
    if (!authUser) return res.status(401).json({ message: "Unauthorized" });

    const notes = await prisma.note.findMany({ where: { tenantId: authUser.tenantId } });
    res.json(notes);
});

router.get("/notes/:id", authMiddleware, async (req: Request, res: Response) => {
    const id = req.params.id;
    if (!id) return res.status(401).json({ message: "Id is required" });
    const authUser = req.user;
    if (!authUser) return res.status(401).json({ message: "Unauthorized" });

    const note = await prisma.note.findUnique({ where: { id: id } });
    if (!note || note.tenantId !== authUser.tenantId) {
        return res.status(404).json({ message: "Note not found" });
    }
    res.json(note);
});

router.put("/notes/:id", authMiddleware, async (req: Request, res: Response) => {
    const id = req.params.id;
    if (!id) return res.status(401).json({ message: "Id is required" });
    const authUser = req.user;
    if (!authUser) return res.status(401).json({ message: "Unauthorized" });

    const { title, content } = req.body;
    const note = await prisma.note.findUnique({ where: { id: id } });
    if (!note || note.tenantId !== authUser.tenantId) {
        return res.status(404).json({ message: "Note not found" });
    }

    const updated = await prisma.note.update({
        where: { id: id },
        data: { title, content },
    });

    res.json(updated);
});

router.delete("/notes/:id", authMiddleware, async (req: Request, res: Response) => {
    const id = req.params.id;
    if (!id) return res.status(401).json({ message: "Id is required" });
    const authUser = req.user;
    if (!authUser) return res.status(401).json({ message: "Unauthorized" });

    const note = await prisma.note.findUnique({ where: { id: id } });
    if (!note || note.tenantId !== authUser.tenantId) {
        return res.status(404).json({ message: "Note not found" });
    }

    await prisma.note.delete({ where: { id: id } });
    res.json({ message: "Note deleted" });
});

export default router;