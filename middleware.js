/* jwt */
import jwt from 'jsonwebtoken'

export const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]

    if(!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        if(err) {
            console.log(err);
            return res.status(400).json(err);
        }
        req.tokenPayload = payload;
        next();
    })
}
// Tokenimizin tipi Bearer olduğundan authorization yaparken tokenin başına Bearer eklenir
// Kullanıcı servisi çalıştırmak istediginde ilk olarak istek middleware e geliyor !!! burda error almazsa sonraki aşamaya devam edebilir
// Bearer tokenler sahip olunan kişiler tarafından kullanılabilir.