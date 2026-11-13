const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});


app.post('/api/reports',upload.single('photo'), (req, res) =>{
    const {name, category, building, description } = req.body;
    const photo = req.file ? req.file.filename : null;
    const code = 'CIT-' + Math.random().toString(36).substring(2,7).toUpperCase();


    db.prepare(
        'INSERT INTO  reports (code, name, category, building, description, photo)VALUES (?,?,?,?,?,?)'
    ).run(code, name, category, building, description, photo);
    res.json({ code});    

});

app.get('/api/reports/:code', (req, res) => {
  const code = req.params.code;

  const row = db.prepare(
    'SELECT status, category, building, created_at FROM reports WHERE code = ?'
  ).get(code);

  if (!row) {
    return res.status(404).json({ error: 'Not found' });
  }

  res.json(row);
});



function requireAdmin(req, res, next){
    if (req.headers['x-admin-password'] !== ADMIN_PASSWORD){
        return res.status(401).json({error: 'Unauthorized'});
    }
    next();   
}
app.get('/api/admin/reports', requireAdmin,(req, res) => {
    const rows = db.prepare('SELECT * FROM reports ORDER BY id DESC').all();
    res.json(rows);
});

app.patch('/api/admin/reports/:id', requireAdmin, (req, res) =>{
    const id = req.params.id;
    const status = req.body.status;
    const allowed = ['Submitted', 'In Progress', 'Resolved'];

    if (!allowed.includes(status)){
        return res.status(400).json({ error: 'Invalid status'});
    }

    db.prepare('UPDATE reports SET status = ? WHERE id = ?').run(status, id);
    res.json({ok: true});
});






app.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT);
});