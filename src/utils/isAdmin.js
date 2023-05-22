export default function isAdmin(req, res, next) {
  if (
    (req.user && req.user.role === "admin") ||
    (req.user && req.user.role === "masteradmin")
  ) {
    next();
  } else {
    res.status(401).send({ message: "Invalid Admin Token" });
  }
};
