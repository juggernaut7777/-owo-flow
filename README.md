# KOFA Commerce Engine 🚀

AI-powered commerce platform for modern merchants. Built with FastAPI, Supabase, and React Native.

## ✨ Features

- 🛍️ **Inventory Management** - Add products with voice tags for smart search
- 💬 **AI Sales Bot** - Professional or Nigerian-style responses (toggleable)
- 💳 **Payment Integration** - Local and international payments
- 📦 **Order Management** - Track orders with status updates
- 💰 **Expense Tracking** - Monitor business vs personal spend
- 📊 **Analytics** - Sales channels, profit/loss reports
- 📱 **Mobile Dashboard** - React Native merchant app

## 🚀 Quick Start

### Local Development

```bash
cd kofa
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Run server
uvicorn chatbot.main:app --reload
```

API: `http://localhost:8000` | Docs: `http://localhost:8000/docs`

### Deploy to Render

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## 📁 Project Structure

```
kofa/
├── chatbot/           # FastAPI backend
│   ├── main.py        # API endpoints
│   ├── routers/       # Feature routers
│   └── services/      # Business logic
├── mobile/            # React Native app
├── landing/           # Marketing page
├── supabase/          # Database schema
└── tests/             # Test suite
```

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/message` | Chat with AI bot |
| GET | `/products` | List inventory |
| POST | `/products` | Add product |
| GET | `/orders` | List orders |
| POST | `/orders` | Create order |
| POST | `/sales/manual` | Log manual sale |
| POST | `/settings/bot-style` | Toggle bot personality |

## 📱 Mobile App

```bash
cd mobile
npm install
npx expo start
```

## 📄 License

MIT License
