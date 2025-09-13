import express from "express";
import cors from "cors";
import router from "./routes.js";
import { authMiddleware } from "./middleware/auth.js";
import { config } from "./lib/config.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});


app.use("/", router);

const PORT = config.PORT;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

export default app;