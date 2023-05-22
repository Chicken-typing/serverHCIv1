export default function isMasterAdmin(req, res, next) {
  if (req.user && req.user.role === "masteradmin") {
    next();
  } else {
    res.status(401).send({ message: "Invalid Admin Token" });
  }
};
