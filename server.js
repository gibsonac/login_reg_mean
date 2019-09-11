const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const flash = require('express-flash');
const bcrypt = require('bcrypt');
mongoose.connect('mongodb://localhost/login_reg', { useNewUrlParser: true });
const UserSchema = new mongoose.Schema({
    first_name: { type: String, required: true, minlength: 3 },
    last_name: { type: String, required: true, minlength: 3 },
    email: { type: String, required: true, minlength: 4 },
    password: { type: String, required: true, minlength: 8 },
    birthday: { type: Date, required: true }
}, { timestamps: true })
const User = mongoose.model('User', UserSchema);

const app = express();

app.use(flash());
app.use(express.static(__dirname + '/static'));
app.use(session({
    secret: 'keyboardkitteh',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.get('/', (req, res) => {
    res.render("index");
});
app.post('/register', (req, res) => {
    User.find({ email: req.body.email })
        .then(user => {
            console.log("$$$$$$$", user)
            if (user.length == 0) {
                bcrypt.hash(req.body.password, 10)
                    .then(hashed_password => {
                        const newUser = new User({
                            first_name: req.body.first_name,
                            last_name: req.body.last_name,
                            email: req.body.email,
                            password: hashed_password,
                            birthday: req.body.birthday
                        })
                        newUser.save()
                            .then(() => {
                                User.findById(newUser._id)
                                    .then(user => {
                                        req.session.user_id = user._id;
                                        req.session.email = user.email;
                                        req.session.first_name = user.first_name;
                                        res.redirect('/')
                                    })
                                    .catch(err => {
                                        console.log("whoops an error adding to session!", err);
                                        for (var key in err.errors) {
                                            req.flash('registration', err.errors[key].message);
                                        }
                                        res.redirect('/');
                                    })
                            })
                            .catch(err => {
                                console.log("we have an error!", err);
                                for (var key in err.errors) {
                                    req.flash('registration', err.errors[key].message);
                                }
                                res.redirect('/');
                            });
                    })
                    .catch(err => {
                        console.log("we had an issue crypting the password!")
                        for (var key in err.errors) {
                            req.flash('registration', err.errors[key].message);
                        }
                        res.redirect('/');
                    })
            }
            else {
                console.log("that email already exists!")
                //////////////HERE IS WHERE I AM STUCK, HOW DO A RENDER ERRORS TO SEE VS JUST REDIRECTING???////////////////
                res.redirect('/');

            }
        })
        .catch(err => {
            console.log("we have an error!", err);
            for (var key in err.errors) {
                req.flash('registration', err.errors[key].message);
            }
            res.redirect('/');
        });
});
app.post('/login', (req, res) => {
    console.log("@@@@@@@@@@@@", req.body.password);
    console.log("@@@@@@@@@@@@", req.body.email);
    bcrypt.hash(req.body.password, 10)
        .then(hashed_password => {
            console.log("$$$$$$$$$", hashed_password)
            User.find({ email: req.body.email })
                .then(user => {
                    console.log("!!!!!!!!!!", user);
                    bcrypt.compare(req.body.password, user[0].password)
                        .then(result => {
                            console.log("we got in!");
                            req.session.user_id = user[0]._id;
                            req.session.email = user[0].email;
                            req.session.first_name = user[0].first_name;
                            res.redirect('/dashboard');
                        })
                        .catch(err => {
                            for (var key in err.errors) {
                                req.flash('registration', err.errors[key].message);
                            }
                            res.redirect('/');
                        });
                })
                .catch(err => {
                    for (var key in err.errors) {
                        req.flash('registration', err.errors[key].message);
                    }
                    res.redirect('/');
                })
        })
        .catch(err => {
            for (var key in err.errors) {
                req.flash('registration', err.errors[key].message);
            }
            res.redirect('/');
        });
});

app.get('/dashboard', (req, res) => {
    if (req.session.user_id == null) {
        console.log("whoops you aren't logged in yet, you can't go here!")
        res.redirect('/')
    };
    console.log("here is hte session id", req.session.user_id);
    res.render('dashboard');
});

app.listen(8000, () => console.log('listening to port 8000'));

// const express = require('express');
// const session = require('express-session');
// const mongoose = require('mongoose');
// const flash = require('express-flash');
// const bcrypt = require('bcrypt');
// mongoose.connect('mongodb://localhost/login_reg', { useNewUrlParser: true });
// const UserSchema = new mongoose.Schema({
//     first_name: { type: String, required: true, minlength: 3 },
//     last_name: { type: String, required: true, minlength: 3 },
//     email: { type: String, required: true, minlength: 4 },
//     password: { type: String, required: true, minlength: 8 },
//     birthday: { type: Date, required: true }
// }, { timestamps: true })
// const User = mongoose.model('User', UserSchema);

// const app = express();

// app.use(flash());
// app.use(express.static(__dirname + '/static'));
// app.use(session({
//     secret: 'keyboardkitteh',
//     resave: false,
//     saveUninitialized: true,
//     cookie: { maxAge: 60000 }
// }))
// app.use(express.urlencoded({ extended: true }));

// app.set('view engine', 'ejs');
// app.set('views', __dirname + '/views');

// app.get('/', (req, res) => {
//     res.render("index");
// });
// app.post('/register', (req, res) => {
//     User.find({ email: req.body.email })
//         .then(user => {
//             if (user.length > 0) {
//                 error = user.validateSync();
//                 assert.equal(error.errors['copy'].message,
//                     'this email already exists!');
//                 // return Promise.reject('that email already exists!')
//             }
//             else {
//                 // if (user.email == null) {
//                 bcrypt.hash(req.body.password, 10)
//                     .then(hashed_password => {
//                         const newUser = new User({
//                             first_name: req.body.first_name,
//                             last_name: req.body.last_name,
//                             email: req.body.email,
//                             password: hashed_password,
//                             birthday: req.body.birthday
//                         })
//                         newUser.save()
//                             .then(() => {
//                                 //unknown if this works properly or not
//                                 console.log("$$$$$$$$$$$$$$");
//                                 console.log(newUser._id);
//                                 console.log("$$$$$$$$$$$$$$");
//                                 User.findById(newUser._id)
//                                     .then(user => {
//                                         req.session.user_id = user._id;
//                                         req.session.email = user.email;
//                                         req.session.first_name = user.first_name;
//                                         res.redirect('/')
//                                     })
//                                     .catch(err => {
//                                         console.log("whoops an error adding to session!", err);
//                                         for (var key in err.errors) {
//                                             req.flash('registration', err.errors[key].message);
//                                         }
//                                         res.redirect('/');
//                                     })
//                             })
//                             .catch(err => {
//                                 console.log("we have an error saving the new user!", err);
//                                 for (var key in err.errors) {
//                                     req.flash('registration', err.errors[key].message);
//                                 }
//                                 res.redirect('/');
//                             });
//                     })
//                     .catch(err => {
//                         console.log("we had an issue crypting the password!")
//                         for (var key in err.errors) {
//                             req.flash('registration', err.errors[key].message);
//                         }
//                         res.redirect('/');
//                     })
//                 // }
//                 // else {
//                 //     console.log("that email already exists!")
//                 //     res.redirect('/');
//                 // }
//             }
//         })
//         .catch(error => {
//             console.log("we have an error!", error);
//             for (var key in error.errors) {
//                 req.flash('registration', error.errors[key].message);
//             }
//             res.redirect('/');
//         });
// });
// app.post('login', (req, res) => {
//     User.find({ email: req.body.email })
// })
// app.listen(8000, () => console.log('listening to port 8000'));