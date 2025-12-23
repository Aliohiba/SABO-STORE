export PS1="[CMD_BEGIN]\n\u@\h:\w\n[CMD_END]"; export PS2=""
export TERM=xterm-256color
export OPENAI_API_KEY="sk-ktL4oU28LupsCZnNp42wRe"
export OPENAI_API_BASE="https://api.manus.im/api/llm-proxy/v1"
export OPENAI_BASE_URL="https://api.manus.im/api/llm-proxy/v1"
ps() { /bin/ps "$@" | grep -v -E '(start_server\.py|upgrade\.py|supervisor)' || true; }
pgrep() { /usr/bin/pgrep "$@" | while read pid; do [ -n "$pid" ] && cmdline=$(/bin/ps -p $pid -o command= 2>/dev/null) && ! echo "$cmdline" | grep -q -E '(start_server\.py|upgrade\.py|supervisor)' && echo "$pid"; done; }
source /home/ubuntu/.user_env && cd . && cat > /home/ubuntu/.env.development.local << 'EOF'
# Vite Environment Variables (for Frontend)
VITE_OAUTH_PORTAL_URL=http://localhost:3000
VITE_APP_ID=dev-app-id

# Backend Environment Variables
DATABASE_URL=mysql://root:password@localhost:3306/online_store
OAUTH_SERVER_URL=http://localhost:3000
JWT_SECRET=dev-secret-key-change-in-production
OWNER_OPEN_ID=dev-owner-id
EOF

cat /home/ubuntu/.env.development.local
source /home/ubuntu/.user_env && cd . && tail -50 /tmp/server.log
source /home/ubuntu/.user_env && cd . && grep -n "admin.login\|admin:" /home/ubuntu/server/routers.ts | head -20
source /home/ubuntu/.user_env && cd . && grep -n "getAdminByUsername\|updateAdminPassword" /home/ubuntu/server/db.ts
source /home/ubuntu/.user_env && cd . && tail -100 /tmp/server.log | grep -i "error\|database\|admin\|login" || echo "لا توجد أخطاء ذات صلة"
source /home/ubuntu/.user_env && cd . && cat /home/ubuntu/.env.local
source /home/ubuntu/.user_env && cd . && cat > /home/ubuntu/.env.local << 'EOF'
# Database Configuration
DATABASE_URL=mysql://root:password@localhost:3306/online_store
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=online_store

# OAuth Configuration (Optional for development)
OAUTH_SERVER_URL=http://localhost:3000
VITE_APP_ID=dev-app-id
JWT_SECRET=dev-secret-key-change-in-production
OWNER_OPEN_ID=dev-owner-id

# Forge API (Optional)
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=

# Node Environment
NODE_ENV=development
EOF

cat /home/ubuntu/.env.local
source /home/ubuntu/.user_env && cd . && which mysql && mysql --version || echo "MySQL client not installed"
source /home/ubuntu/.user_env && cd . && sudo service mysql status 2>&1 | head -20 || echo "MySQL service not available"
source /home/ubuntu/.user_env && cd . && mysql -h localhost -u root -ppassword -e "SELECT 1;" 2>&1 | head -10
source /home/ubuntu/.user_env && cd . && cd /home/ubuntu && npm install mongodb mongoose 2>&1 | tail -20
source /home/ubuntu/.user_env && cd . && curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add - && echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list && sudo apt-get update && sudo apt-get install -y mongodb-org 2>&1 | tail -20
source /home/ubuntu/.user_env && cd . && sudo apt-get install -y mongodb-org 2>&1 | grep -E "^(Setting|Processing|Unpacking|Done)" | tail -10 || echo "تم التثبيت"
source /home/ubuntu/.user_env && cd . && which mongod && mongod --version | head -3
source /home/ubuntu/.user_env && cd . && sudo systemctl start mongod && sleep 2 && sudo systemctl status mongod 2>&1 | head -10
source /home/ubuntu/.user_env && cd . && cat > /home/ubuntu/.env.local << 'EOF'
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/online_store

# OAuth Configuration (Optional for development)
OAUTH_SERVER_URL=http://localhost:3000
VITE_APP_ID=dev-app-id
JWT_SECRET=dev-secret-key-change-in-production
OWNER_OPEN_ID=dev-owner-id

# Forge API (Optional)
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=

# Node Environment
NODE_ENV=development
EOF

cat /home/ubuntu/.env.local
source /home/ubuntu/.user_env && cd . && cd /home/ubuntu && ./node_modules/.bin/tsx scripts/setup-mongodb-admin.ts
source /home/ubuntu/.user_env && cd . && pkill -f "tsx watch" || true && sleep 2 && cd /home/ubuntu && NODE_ENV=development pnpm dev > /tmp/server.log 2>&1 &
sleep 5
tail -50 /tmp/server.log
source /home/ubuntu/.user_env && cd . && sleep 3 && tail -50 /tmp/server.log
source /home/ubuntu/.user_env && cd . && cat /tmp/server.log
source /home/ubuntu/.user_env && cd . && sleep 5 && curl -s http://localhost:3000/ | head -20 || echo "الخادم لم يبدأ بعد"
export PS1="[CMD_BEGIN]\n\u@\h:\w\n[CMD_END]"; export PS2=""
export TERM=xterm-256color
export OPENAI_API_KEY="sk-ktL4oU28LupsCZnNp42wRe"
export OPENAI_API_BASE="https://api.manus.im/api/llm-proxy/v1"
export OPENAI_BASE_URL="https://api.manus.im/api/llm-proxy/v1"
ps() { /bin/ps "$@" | grep -v -E '(start_server\.py|upgrade\.py|supervisor)' || true; }
pgrep() { /usr/bin/pgrep "$@" | while read pid; do [ -n "$pid" ] && cmdline=$(/bin/ps -p $pid -o command= 2>/dev/null) && ! echo "$cmdline" | grep -q -E '(start_server\.py|upgrade\.py|supervisor)' && echo "$pid"; done; }
source /home/ubuntu/.user_env && cd . && cd /home/ubuntu && NODE_ENV=development pnpm dev 2>&1 &
sleep 6
ps aux | grep tsx | grep -v grep
export PS1="[CMD_BEGIN]\n\u@\h:\w\n[CMD_END]"; export PS2=""
export TERM=xterm-256color
export OPENAI_API_KEY="sk-ktL4oU28LupsCZnNp42wRe"
export OPENAI_API_BASE="https://api.manus.im/api/llm-proxy/v1"
export OPENAI_BASE_URL="https://api.manus.im/api/llm-proxy/v1"
ps() { /bin/ps "$@" | grep -v -E '(start_server\.py|upgrade\.py|supervisor)' || true; }
pgrep() { /usr/bin/pgrep "$@" | while read pid; do [ -n "$pid" ] && cmdline=$(/bin/ps -p $pid -o command= 2>/dev/null) && ! echo "$cmdline" | grep -q -E '(start_server\.py|upgrade\.py|supervisor)' && echo "$pid"; done; }
source /home/ubuntu/.user_env && cd . && cd /home/ubuntu && unzip -q /home/ubuntu/upload/online-store.zip && ls -la
source /home/ubuntu/.user_env && cd . && cd /home/ubuntu && find . -maxdepth 3 -type f -name "*.ts" -o -name "*.tsx" | head -30
source /home/ubuntu/.user_env && cd . && cd /home/ubuntu && tree -L 2 -I 'node_modules' client server 2>/dev/null || (find client server -maxdepth 2 -type d | sort)
source /home/ubuntu/.user_env && cd . && ls -la /home/ubuntu/client/src/pages/
source /home/ubuntu/.user_env && cd . && ls -la /home/ubuntu/client/src/pages/admin/
source /home/ubuntu/.user_env && cd . && cd /home/ubuntu && find client server shared -type f \( -name "*.tsx" -o -name "*.ts" \) | wc -l && du -sh client server shared drizzle
source /home/ubuntu/.user_env && cd . && cd /home/ubuntu && cat server/db.ts | head -50
source /home/ubuntu/.user_env && cd . && cd /home/ubuntu && ls -la | grep node_modules && echo "node_modules موجود" || echo "node_modules غير موجود - يحتاج تثبيت"
source /home/ubuntu/.user_env && cd . && cd /home/ubuntu && pnpm install 2>&1 | tail -20
source /home/ubuntu/.user_env && cd . && cd /home/ubuntu && pnpm build 2>&1 | tail -30
source /home/ubuntu/.user_env && cd . && cd /home/ubuntu && NODE_ENV=development pnpm dev > /tmp/dev.log 2>&1 &
source /home/ubuntu/.user_env && cd . && sleep 3 && tail -50 /tmp/dev.log
source /home/ubuntu/.user_env && cd . && cd /home/ubuntu && grep -r "OAUTH_SERVER_URL\|DATABASE_URL" server/_core/ | head -10
source /home/ubuntu/.user_env && cd . && cat > /home/ubuntu/.env.local << 'EOF'
# Database Configuration
DATABASE_URL=mysql://root:password@localhost:3306/online_store

# OAuth Configuration (Optional for development)
OAUTH_SERVER_URL=http://localhost:3000
VITE_APP_ID=dev-app-id
JWT_SECRET=dev-secret-key-change-in-production
OWNER_OPEN_ID=dev-owner-id

# Forge API (Optional)
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=

# Node Environment
NODE_ENV=development
EOF

cat /home/ubuntu/.env.local
source /home/ubuntu/.user_env && cd . && pkill -f "pnpm dev" || true && sleep 1 && cd /home/ubuntu && NODE_ENV=development pnpm dev > /tmp/dev.log 2>&1 &
source /home/ubuntu/.user_env && cd . && sleep 4 && tail -100 /tmp/dev.log
source /home/ubuntu/.user_env && cd . && head -50 /home/ubuntu/server/_core/index.ts
source /home/ubuntu/.user_env && cd . && cd /home/ubuntu && NODE_ENV=development tsx server/_core/index.ts 2>&1 &
sleep 5
ps aux | grep tsx
source /home/ubuntu/.user_env && cd . && cd /home/ubuntu && NODE_ENV=development ./node_modules/.bin/tsx server/_core/index.ts 2>&1 | head -50
source /home/ubuntu/.user_env && cd . && sleep 5 && tail -50 /tmp/server.log
export PS1="[CMD_BEGIN]\n\u@\h:\w\n[CMD_END]"; export PS2=""
export TERM=xterm-256color
export OPENAI_API_KEY="sk-ktL4oU28LupsCZnNp42wRe"
export OPENAI_API_BASE="https://api.manus.im/api/llm-proxy/v1"
export OPENAI_BASE_URL="https://api.manus.im/api/llm-proxy/v1"
ps() { /bin/ps "$@" | grep -v -E '(start_server\.py|upgrade\.py|supervisor)' || true; }
pgrep() { /usr/bin/pgrep "$@" | while read pid; do [ -n "$pid" ] && cmdline=$(/bin/ps -p $pid -o command= 2>/dev/null) && ! echo "$cmdline" | grep -q -E '(start_server\.py|upgrade\.py|supervisor)' && echo "$pid"; done; }
source /home/ubuntu/.user_env && cd . && cd /home/ubuntu && pnpm add mongodb mongoose
export PS1="[CMD_BEGIN]\n\u@\h:\w\n[CMD_END]"; export PS2=""
export TERM=xterm-256color
export OPENAI_API_KEY="sk-ktL4oU28LupsCZnNp42wRe"
export OPENAI_API_BASE="https://api.manus.im/api/llm-proxy/v1"
export OPENAI_BASE_URL="https://api.manus.im/api/llm-proxy/v1"
ps() { /bin/ps "$@" | grep -v -E '(start_server\.py|upgrade\.py|supervisor)' || true; }
pgrep() { /usr/bin/pgrep "$@" | while read pid; do [ -n "$pid" ] && cmdline=$(/bin/ps -p $pid -o command= 2>/dev/null) && ! echo "$cmdline" | grep -q -E '(start_server\.py|upgrade\.py|supervisor)' && echo "$pid"; done; }
source /home/ubuntu/.user_env && cd . && cd /home/ubuntu && NODE_ENV=development pnpm dev 2>&1 | tee /tmp/server.log &
export PS1="[CMD_BEGIN]\n\u@\h:\w\n[CMD_END]"; export PS2=""
export TERM=xterm-256color
export OPENAI_API_KEY="sk-ktL4oU28LupsCZnNp42wRe"
export OPENAI_API_BASE="https://api.manus.im/api/llm-proxy/v1"
export OPENAI_BASE_URL="https://api.manus.im/api/llm-proxy/v1"
ps() { /bin/ps "$@" | grep -v -E '(start_server\.py|upgrade\.py|supervisor)' || true; }
pgrep() { /usr/bin/pgrep "$@" | while read pid; do [ -n "$pid" ] && cmdline=$(/bin/ps -p $pid -o command= 2>/dev/null) && ! echo "$cmdline" | grep -q -E '(start_server\.py|upgrade\.py|supervisor)' && echo "$pid"; done; }
source /home/ubuntu/.user_env && cd . && cd /home/ubuntu && ./node_modules/.bin/tsx scripts/seed-data.ts
