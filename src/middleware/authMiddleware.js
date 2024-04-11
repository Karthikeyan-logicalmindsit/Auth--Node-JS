const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;

const verifyToken = async (req, res, next) => {
  try {
    const PATH = req.path;

    if (PATH === "/login" || PATH === "/signup") {
      next();
      return;
    }

    const authorization = req.headers["authorization"];

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Authorization header not found" });
    }

    const token = authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Access token not found" });
    }
    const decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.log("Error in verifyToken middleware:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token has expired" });
    }
    return res.status(403).json({ message: "Token verification failed" });
  }
};
const refreshToken = async (req, res, next) => {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token not found" });
  }

  try {
    const user = await jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    const { _id, email, role } = user;
    console.log("User information:", { _id, email, role });
    const accessToken = jwt.sign(
      { userId: _id, email, role },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "5h" }
    );
    console.log("Access token generated:", accessToken);
    req.accessToken = accessToken;
    console.log("Refresh token verified successfully");
    console.log(req.path);
    next();
  } catch (error) {
    console.error("Refresh token verification failed:", error.message);
    res.status(403).json({ message: "Refresh token verification failed" });
  }
};

module.exports = { verifyToken, refreshToken };
