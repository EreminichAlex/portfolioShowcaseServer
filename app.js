const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const jwt = require('jsonwebtoken');
// const session = require("express-session");
const mysql = require("mysql2");
const path = require("path");
const router = require("./routes/auth");
const User = require("./models/user");
const { nextTick, title } = require("process");
const cookieParser = require("cookie-parser");
const hbs = require("hbs");
const expressHbs = require("express-handlebars");
const {Profile} = require("./models/profile");
const {Portfolio} = require("./models/portfolio");
const multer = require("multer");
const { log } = require("console");

const app = express();

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '/views'))
hbs.registerPartials(path.join(__dirname, '/views/partials'));

app.use(handleExpiredTokenError)

app.engine("hbs", expressHbs.engine(
    {
        layoutsDir: "views/layouts", 
        defaultLayout: "information",
        extname: "hbs"
    }
))

const storage = multer.diskStorage({
    destination: function(req,file, cb) {
        cb(null, "uploads/");
    },
    filename: function(req,file,cb) {
        cb(null,file.originalname)
    }
})
const upload = multer({storage: storage});


app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());


function handleExpiredTokenError(err,req,res,next) {
    if (err.name === "TokenExpiredError" && !req.cookies.authToken) {
        // Переадресация на страницу авторизации
        return res.sendFile(path.join(__dirname, "../portfolio/dist/pages/login.html"))

      }
    next(err);
}

function requireAuth(req,res,next) {
    const token = req.cookies.authToken;
    if (!token) {
        return res.status(401).render("information-body", {
            layout: "information",
            title: "Ошибка",
            pageTitle: "Требуется авторизация!",
            haveMessage: false,
            message: "",
            link: "/login",
            linkMessage: "назад",
            isAuth: Boolean(req.cookies.authToken)

        })
    }

    try {
        const decodedToken = jwt.verify(token, 'secret-PortfolioUserToken-231sca');
        req.user = decodedToken;
        next();
    } catch(error) {
        console.log(error);
        return res.status(401).render("information-body", {
            layout: "information",
            title: "Ошибка",
            pageTitle: "Неверный токен/отсутствие токена, попробуйте позже.",
            haveMessage: false,
            message: "",
            link: "/",
            linkMessage: "На главную",
            isAuth: Boolean(req.cookies.authToken)
        })
    }
}

// БАЗОВЫЕ ПУТИ
app.get("/", (req,res) => {
    // res.status(200).sendFile(path.join(__dirname, "../portfolio/dist/index.html"))
    
    if (req.cookies.authToken) {
        const user = jwt.verify(req.cookies.authToken, 'secret-PortfolioUserToken-231sca')
        res.render("index", {
            layout:false,
            isAuth: true,
            profileNickname: user.nickname
        })
    } else {
        res.render("index", {
            layout:false,
            isAuth: false
        })
    }
})

app.use(express.static(path.join(__dirname, "../portfolio/dist")));
app.use(express.static(path.join(__dirname, "uploads")))
// РЕГИСТРАЦИЯ
app.get("/registration", (req,res) => {
    res.sendFile(path.join(__dirname, "../portfolio/dist/pages/registration.html"));
})

// АВТОРИЗАЦИЯ
app.get("/login", (req,res) => {
    res.sendFile(path.join(__dirname, "../portfolio/dist/pages/login.html"))
})

app.get("/logout", (req,res) => {
    const token = req.cookies.authToken;

    if (!token) {
        return res.status(401).render("information-body", {
            layout: "information",
            title: "Ошибка",
            pageTitle: "Вы не аутентифицированы!",
            haveMessage: false,
            message: "",
            link: "/",
            linkMessage: "На главную",
            isAuth: Boolean(req.cookies.authToken)

        })
    } else {
        return res.render("logout",{
            layout: false,
            title: "Выход",
            pageTitle: "Выход",
            isAuth: Boolean(req.cookies.authToken)
        })
    }
})

// ПРОФИЛЬ
app.get("/profile", requireAuth,async (req,res) => {

    const userArr = await User.findByNickname(req.user.nickname);
    const user = userArr[0];
    const userData = userArr[1];
    const cardsArr = await Profile.getAllPortfolioByUserId(userData.user_id);
    res.render("profile", {
        layout: false,
        Nickname: user.nickname,
        Email: user.email,
        Cards: cardsArr
    })
})

// app.get("/profile/:profileNickname", async (req,res) => {
//         const token = req.cookies.authToken;
//         const userArr = await User.findByNickname(req.params.profileNickname);
//         const user = userArr[0];
//         const userData = userArr[1];
//         const cardsArr = await Profile.getAllPortfolioByUserId(userData.user_id);

//         if (!user) {
//             return res.status(404).render("information-body", {
//                 layout: "information",
//                 title: "ошибка",
//                 pageTitle: "Профиль не найден!",
//                 haveMessage: false,
//                 message: "",
//                 link: "/",
//                 linkMessage: "Назад",
//                 isAuth: Boolean(req.cookies.authToken)
//             })
//         }
//         if (!token) {
//             res.render("profile", {
//                 layout: false,
//                 Nickname: user.nickname,
//                 Email: user.email,
//                 Cards: cardsArr,
//                 profileNickname: user.nickname,
//                 isGuest: true
//             })
//         } else if (currentUser.nickname !== req.params.profileNickname) {
//             const currentUser = jwt.verify(token, 'secret-PortfolioUserToken-231sca');

//             res.render("profile", {
//                 layout: false,
//                 Nickname: user.nickname,
//                 Email: user.email,
//                 Cards: cardsArr,
//                 profileNickname: user.nickname,
//                 isGuest: true
//             })
//         } else {
//             res.render("profile", {
//                 layout: false,
//                 Nickname: user.nickname,
//                 Email: user.email,
//                 Cards: cardsArr,
//                 profileNickname: user.nickname,
//                 isGuest: false
//             })
//         }

        
//         // console.log(err)
//         // return res.status(500).render("information-body", {
//         //     layout: "information",
//         //     title: "ошибка",
//         //     pageTitle: "Ошибка при загрузке профиля!",
//         //     haveMessage: true,
//         //     message: "Попробуйте еще раз!",
//         //     link: "/",
//         //     linkMessage: "Назад",
//         //     isAuth: Boolean(req.cookies.authToken)
//         // })

// })

app.get("/profile/:profileNickname", async (req,res) => {
    const userArr = await User.findByNickname(req.params.profileNickname);
    const user = userArr[0];
    const userData = userArr[1];
    const cardsArr = await Profile.getAllPortfolioByUserId(userData.user_id);
    console.log(cardsArr)
    if (!req.cookies.authToken) {
        return res.render("profile", {
            layout: false,
            Nickname: user.nickname,
            Email: user.email,
            Cards: cardsArr,
            profileNickname: user.nickname,
            isGuest: true,
            notAuthorized: true
        })
    }
    const token = req.cookies.authToken;
    const currentUser = jwt.verify(token, 'secret-PortfolioUserToken-231sca');

    if (!user) {
        return res.status(404).render("information-body", {
            layout: "information",
            title: "ошибка",
            pageTitle: "Профиль не найден!",
            haveMessage: false,
            message: "",
            link: "/",
            linkMessage: "Назад",
            isAuth: Boolean(req.cookies.authToken)
        })
    }
    if (currentUser.nickname !== req.params.profileNickname) {

        res.render("profile", {
            layout: false,
            Nickname: user.nickname,
            Email: user.email,
            Cards: cardsArr,
            profileNickname: currentUser.nickname,
            isGuest: true,
            notAuthorized: false
        })
    } else {
        res.render("profile", {
            layout: false,
            Nickname: user.nickname,
            Email: user.email,
            Cards: cardsArr,
            profileNickname: currentUser.nickname,
            isGuest: false,
            notAuthorized: false
        })
    }

})

app.get("/portfolio/:portfolioId", async (req,res) => {
    const portfolio = await Profile.getByPortfolioId(req.params.portfolioId);

    if (!portfolio) {
        return res.status(404).render("information-body", {
            layout: "information",
            title: "ошибка",
            pageTitle: "Портфолио не найдено!",
            haveMessage: false,
            message: "",
            link: "/",
            linkMessage: "Назад",
            isAuth: Boolean(req.cookies.authToken)
        })
    }

    const targetUser = await User.findById(portfolio.user_id);
    const userData = targetUser;
    
    const contacts = await Portfolio.getAllContacts(req.params.portfolioId);
    const sections = await Portfolio.getAllSections(req.params.portfolioId);
    const works = await Portfolio.getAllWorks(sections.id);
    const allPortfolioWorks = await Portfolio.getAllWorksByPortfolioId(req.params.portfolioId)

    const resSections = await Promise.all(sections.map(async (section) => {
        return {
            id: section.id,
          name: section.name,
          works: await Portfolio.getAllWorks(section.id)
        }
      }))
    
    

    if (!req.cookies.authToken) {
        return res.render("portfolio", {
            layout: false,
            Nickname: targetUser.nickname,
            Name: portfolio.name,
            PortfolioDescription: portfolio.description,
            profileNickname: targetUser.nickname,
            Contacts: contacts,
            Sections: resSections,
            Works: allPortfolioWorks,
            BackgroundColor: portfolio.background_color,
            isGuest: true,
            notAuthorized: true
        })
    }
    const token = req.cookies.authToken;
    const currentUser = jwt.verify(token, 'secret-PortfolioUserToken-231sca');
    const currentUserData = await User.findByNickname(currentUser.nickname);

        if (currentUserData[1].user_id !== portfolio.user_id) {
            res.render("portfolio", {
                layout: false,
                Nickname: targetUser.nickname,
                Name: portfolio.name,
                PortfolioDescription: portfolio.description,
                profileNickname: currentUser.nickname,
                Contacts: contacts,
                Sections: resSections,
                Works: allPortfolioWorks,
                BackgroundColor: portfolio.background_color,
                isGuest: true,
                notAuthorized: false
            })
        } else {
            res.render("portfolio", {
                layout: false,
                Nickname: targetUser.nickname,
                Name: portfolio.name,
                PortfolioDescription: portfolio.description,
                profileNickname: currentUser.nickname,
                Contacts: contacts,
                Sections: resSections,
                Works: allPortfolioWorks,
                BackgroundColor: portfolio.background_color,
                isGuest: false,
                notAuthorized: false
            })
        }
})

app.post("/registration", router);
app.post("/login", router);
app.post("/logout", router);
app.post("/addPortfolio", requireAuth,(req,res) => {

    const {formPortfolioName: portfolioName, formPortfolioUserName: name, formPortfolioDescr: description} = req.body;
    const portfolio = new Profile(portfolioName, name, description)
    try {
        portfolio.savePortfolio(req.user.nickname);
    } catch(error) {
        console.log(error.message);
        return res.status(503).render("information-body", {
            layout: "information",
            title: "ошибка",
            pageTitle: "Ошибка создания портфолио!",
            haveMessage: true,
            message: "Попробуйте еще раз!",
            link: "/profile",
            linkMessage: "Назад",
            isAuth: Boolean(req.cookies.authToken)
        })
    } finally {
        res.status(200).redirect('/profile');
    }
})

app.post("/portfolio/:portfolioId/add-contact", async (req,res) => {
    try {
        const portfolio = new Portfolio(req.params.portfolioId);
        await portfolio.saveContact(req.body);
        res.sendStatus(200);
    } catch(err) {
        console.log(err)
        res.sendStatus(500)
    }
})

app.delete("/portfolio/:portfolioId/delete-contact", async (req,res) => {
    try {
        const portfolio = new Portfolio(req.params.portfolioId);
        const contact = await portfolio.findContactId(req.body.link, req.body.linkName);
        await Portfolio.deleteContact(contact.contact_id);
        res.sendStatus(200);
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})

app.put("/portfolio/:portfolioId/change-name", async (req,res) => {
    try {
        const portfolio = new Portfolio(req.params.portfolioId);
        await portfolio.changeName(req.body.name)
        res.status(200);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
})

app.put("/portfolio/:portfolioId/change-description", async (req,res) => {
    try {
        const portfolio = new Portfolio(req.params.portfolioId);
        await portfolio.changeDescription(req.body.description);
        res.sendStatus(200);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
})

app.put("/portfolio/:portfolioId/change-backgroundColor", async (req,res) => {
    try {
        const portfolio = new Portfolio(req.params.portfolioId);
        console.log("req.body.backgroundColor",req.body.backgroundColor)
        await portfolio.changeBackgroundColor(req.body.backgroundColor);
        res.sendStatus(200);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
})

app.delete("/portfolio/:portfolioId/delete-portfolio", async (req,res) => {
    try {
        const portfolio = new Portfolio(req.body.portfolioId);
        await portfolio.deletePortfolio();
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    } finally {
        res.status(302).redirect('/');
    }
})

app.post("/portfolio/:portfolioId/add-section", async (req,res) => {
    try {
        const portfolio = new Portfolio(req.body.portfolioId);
        await portfolio.saveSection(req.body.sectionName);
        res.sendStatus(200);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
})

app.put("/portfolio/:portfolioId/change-section-name", async (req,res) => {
    try {
        const portfolio = new Portfolio(req.body.portfolioId);
        let section = await portfolio.getSectionByName(req.body.previousName);
        let compareResult = await Portfolio.compareNewSectionName(req.body.name);
        if (compareResult > 0) {
            return res.sendStatus(503);
        } else {
            portfolio.changeSectionName(req.body.name, section.id);
            return res.sendStatus(200);
        }
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
})

app.delete("/portfolio/:portfolioId/delete-section", async (req,res) => {
    try {
        const portfolio = new Portfolio(req.body.portfolioId);
        const section = await portfolio.getSectionByName(req.body.sectionName);
        Portfolio.deleteSection(section.id);
        res.sendStatus(200)
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    } 
})

app.post("/portfolio/:portfolioId/upload", upload.single("file") ,async (req,res)=> {
    const portfolio = new Portfolio(req.params.portfolioId);
    const section = await portfolio.getSectionByName(req.body.sectionName);

    await portfolio.saveWork(section.id, req.body.workName, req.body.workDescription, req.body.workLink, req.body.workPath);

    res.status(200).send("Файл упешно загружен");
})

app.post(`/portfolio/:portfolioId/watch-work`, async (req,res) => {
    res.status(200).render("")
})

app.delete("/portfolio/:portfolioId/delete-work", async (req,res) => {
    try {
        Portfolio.deleteWork(req.body.workId);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
})

app.put("/portfolio/:portfolioId/change-work-name", async (req,res) => {
    try {
        const portfolio = new Portfolio(req.body.portfolioId);
        await portfolio.changeWorkName(req.body.workId, req.body.workName);
        res.sendStatus(200)
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }

})

app.put("/portfolio/:portfolioId/change-work-description", async(req,res) => {
    try {
        const portfolio = new Portfolio(req.body.portfolioId);
        await portfolio.changeWorkDescr(req.body.workId, req.body.workDescription);
        
        res.sendStatus(200)
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
})

app.put("/portfolio/:portfolioId/change-work-file", upload.single("file"), async (req,res) => {
    try {
        await Portfolio.changeWorkFile(req.body.workId, req.body.workPath);
        fs.unlink(path.join(__dirname,`/uploads/${req.body.previousFile}`), (err) => {
            if (err) {
                return console.log(err);
            }
        })
        res.sendStatus(200)
    } catch(err) {
        console.log(err)
        res.send(500)
    }
})

app.put("/portfolio/:portfolioId/change-work-section", async (req,res) => {
    try {
        const portfolio = new Portfolio(req.body.portfolioId);
        portfolio.changeWorkSection(req.body.workId, req.body.newSection);
        res.sendStatus(200);
    } catch(err) {
        console.log(err)
        res.send(500)
    }
})

app.listen(8000, ()=>console.log("server started"))

