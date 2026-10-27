const Model = window.BeforeModel;
const app = document.querySelector('#app');
const modal = document.querySelector('#modal');
let state;
try { state = JSON.parse(localStorage.getItem(Model.key)) || Model.seed(); } catch { state = Model.seed(); }
let route = state.session ? 'home' : 'welcome';
let trail = [];
let selectedIndustry = 0;
let selectedPlan = 'media';
let exploreTab = '推荐';
let planTab = '我的计划';
let detailTab = '任务';
let draft = null;
let draftStep = 1;
let loginMode = 'code';
let codeUntil = 0;
let toastTimer;
const esc = Model.escape;
const industries = [
    { title: '游戏行业', subtitle: '从兴趣到职业，了解游戏行业的真实一面', count: '12.6k', icon: 'game', category: '行业', body: '从游戏策划、美术到程序，不同岗位有不同的成长路径。这里有行业动态、入门指南和真实的从业视角。', articles: ['游戏策划需要具备哪些能力？', '游戏美术的学习路径', '独立游戏开发的经验分享'] },
    { title: '自媒体与内容创作', subtitle: '记录生活，也能成为职业', count: '8.3k', icon: 'note', category: '技能', body: '从选题、表达、制作到复盘，用一个小作品开始探索内容创作。先验证兴趣，再建立稳定的创作节奏。', articles: ['如何找到你的第一个内容选题？', '从零开始制作第一条视频', '建立可持续的创作习惯'] },
    { title: '跨专业学习', subtitle: '用新的知识打开更多可能', count: '6.4k', icon: 'book', category: '技能', body: '不必一开始就决定未来。通过基础课程、小型项目和学习记录，逐步判断一个新方向是否适合你。', articles: ['为自己设计一份入门学习地图', '跨专业学习的三个小步骤', '如何验证学习成果'] },
    { title: '城市生活', subtitle: '不同的城市，不同的生活方式', count: '5.2k', icon: 'city', category: '生活', body: '从居住、通勤、工作机会到日常节奏，探索适合自己的城市生活。用一次实地观察代替想象。', articles: ['选择城市前应该了解什么？', '用一个周末认识一座城市', '记录你的理想生活清单'] }
];
industries.push(...window.BeforeExplorations);
let selectedStory = 'M048';
let storyOrigin = null;
let storyFilter = '全部';
state.savedStories = Array.isArray(state.savedStories) ? state.savedStories : [];
state.storyResponses = state.storyResponses || {};
state.dismissedStories = state.dismissedStories || {};
const paths = {
    home: 'M3 10 12 3l9 7v11h-6v-7H9v7H3Z', search: 'M20 20l-5-5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
    plan: 'M5 4h14v17H5ZM8 2v4m8-4v4M8 10h8m-8 4h5', user: 'M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0M3 21v-3a9 9 0 0 1 18 0v3Z',
    rocket: 'M8 16 5 19m3-9-5 1v5h5m6-8 1-5h5v5m-12 8C7 9 13 3 21 3c0 8-6 14-13 13Zm6-7h.01',
    note: 'M5 3h14v18H5Zm4 5h6m-6 4h6m-6 4h3', game: 'M7 6h10l4 11-3 2-4-4h-4l-4 4-3-2Zm0 3v5m-2-2h4m6-2h.01m3 3h.01',
    book: 'm2 8 10-6 10 6-10 6Zm3 4v6l7 4 7-4v-6', city: 'M3 21V8h7v13m0 0V3h8v18m0-10h3v10M6 12h1m-1 4h1m6-9h2m-2 4h2m-2 4h2',
    star: 'm12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z', settings: 'm9 3 6 0 1 4 4 2v6l-4 2-1 4H9l-1-4-4-2V9l4-2Zm6 9a3 3 0 1 0-6 0 3 3 0 0 0 6 0',
    bell: 'M5 17h14l-2-4V8a5 5 0 0 0-10 0v5Zm5 3h4', lock: 'M6 10h12v11H6Zm3 0V6a3 3 0 0 1 6 0v4', phone: 'M7 2h10v20H7Zm3 3h4m-3 14h2', check: 'm5 12 4 4L19 6'
};
const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name] || paths.note}"/></svg>`;
const button = (label, action, extra = '') => `<button type="button" data-action="${action}" ${extra}>${label}</button>`;
const header = title => `<header class="top center">${button('‹', 'back', 'class="back" aria-label="返回"')}<strong>${title}</strong></header>`;
const save = () => { try { localStorage.setItem(Model.key, JSON.stringify(state)); } catch { toast('存储空间不足，当前更改无法保存'); } };
function toast(message) { const element = document.querySelector('#toast'); element.textContent = message; element.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => element.classList.remove('show'), 2800); }
function go(next) { if (next !== route) trail.push(route); route = next; render(); window.scrollTo(0, 0); }
window.beforeBack = function () { if (route === 'story' && storyOrigin) { returnFromStory(); return true; } if (modal.open) { modal.close(); return true; } if (trail.length) { route = trail.pop(); render(); return true; } if (route !== 'home' && state.session) { route = 'home'; render(); return true; } return false; };
function nav(active) { return `<nav class="nav" aria-label="主导航">${[['home','home','首页'],['explore','search','探索'],['plans','plan','计划'],['profile','user','我的']].map(([page, glyph, label]) => button(`${icon(glyph)}${label}`, `nav:${page}`, `class="${active === page ? 'active' : ''}" aria-label="${label}"`)).join('')}</nav>`; }
function page(content, active) { return `<section class="page ${active ? '' : 'no-nav'}" data-page="${route}">${content}</section>${active ? nav(active) : ''}`; }
function progress(plan) { const percent = Model.progress(plan); return `<div class="progress-row"><div class="track"><span style="width:${percent}%"></span></div><span>${percent}%</span></div>`; }
function planCard(plan) { return button(`<div class="row"><span class="bubble small">${icon('rocket')}</span><div class="grow"><h3>${esc(plan.title)}</h3><div style="margin-top:6px"><span class="status">● ${Model.progress(plan) === 100 ? '已完成' : '进行中'}</span> <small>${esc(plan.start)} · ${esc(plan.end)}</small></div></div></div>${progress(plan)}`, `plan:${plan.id}`, 'class="card"'); }
function showModal(title, body) { modal.innerHTML = `<h2>${title}</h2>${body}${button('关闭', 'close', 'class="text-button" style="display:block;margin:15px auto 0"')}`; modal.showModal(); }
function welcome() { return `<section class="welcome" data-page="welcome"><div class="brand">Before</div><div class="eyebrow">EXPLORE<br>PLAN<br>TAKE ACTION!</div><h1>在决定<br>之前</h1><p>用 99 个方法，迈出第一步</p><span class="circle"></span><div class="welcome-art" aria-hidden="true"><div class="dots"></div><div class="blue"></div><div class="orange"></div></div>${button('开始探索 →', 'go:login', 'class="primary"')}</section>`; }
function auth(register) { return page(`${register ? header('') : '<div class="brand">Before</div>'}<div class="auth"><h1>${register ? '注册账号' : '欢迎回来'}</h1>${register ? '<p class="muted">创建你的专属探索空间</p>' : '<h2>开启你的未来探索之旅</h2>'}<form id="auth-form"><div class="input-group">${icon('phone')}<input name="phone" type="tel" inputmode="numeric" maxlength="11" placeholder="请输入手机号" aria-label="手机号" required></div><div class="input-group">${icon('lock')}<input name="credential" ${loginMode === 'password' && !register ? 'type="password" placeholder="请输入密码"' : 'inputmode="numeric" maxlength="6" placeholder="请输入验证码"'} aria-label="${loginMode === 'password' && !register ? '密码' : '验证码'}" required>${loginMode === 'code' || register ? button('获取验证码','code','id="code-button"') : ''}</div>${register ? `<div class="input-group">${icon('lock')}<input name="password" type="password" minlength="6" maxlength="16" placeholder="请输入密码（6–16位）" aria-label="设置密码" required></div><label class="agreement"><input name="agree" type="checkbox" required><span>我已阅读并同意 ${button('《用户协议》','legal:terms')} 和 ${button('《隐私政策》','legal:privacy')}</span></label>` : ''}<div class="form-error" id="auth-error" role="alert"></div><button class="primary" type="submit">${register ? '注册' : '登录'}</button></form>${register ? '' : button(loginMode === 'code' ? '密码登录' : '验证码登录','login-mode','style="display:block;margin:12px auto"')}<div class="auth-footer">${register ? '已有账号？' : '还没有账号？'}${button(register ? '去登录' : '立即注册',register ? 'go:login' : 'go:register','class="text-button"')}</div><p class="auth-note">离线体验版 · 不发送短信、不连接真实账号服务</p>${!register ? button('先体验一下 →','guest','class="text-button" style="display:block;margin:12px auto"') : ''}</div>`); }
function home() { return page(`<header class="top"><span class="brand">Before</span>${button(icon('bell'),'notifications','aria-label="通知"')}</header><h2>你好，<br>欢迎来到在决定之前</h2><button class="search" style="width:100%;color:#9398a4" data-action="go:explore">${icon('search')}探索你感兴趣的方向...</button><div class="hero"><h2>探索更多可能<br>从一个小目标开始</h2>${button('去探索 →','go:explore','class="pill"')}<div class="hero-art"></div></div><div class="shortcuts">${[['探索','rocket','explore'],['计划','note','plans'],['道路','city','explore'],['记录','check','records']].map(([label,glyph,target],index) => button(`<span class="bubble small ${index === 3 ? 'orange' : ''}">${icon(glyph)}</span>${label}`,`go:${target}`,'class="shortcut"')).join('')}</div>${storySection()}<div class="section-heading"><h3>今日推荐</h3>${button('更多 ›','go:explore')}</div>${button(`<div class="row"><img class="thumb" src="art.svg" alt="游戏行业插画"><div class="grow"><h3>游戏行业入门指南</h3><p><span class="tag">行业 · 职业</span> <small>◉ 12.6k 人在看</small></p></div></div>`,'industry:0','class="card"')}<div class="section-heading"><h3>我的下一步</h3>${button('全部计划 ›','go:plans')}</div>${state.plans.length ? planCard(state.plans.find(plan => Model.progress(plan) < 100) || state.plans[0]) : button('创建第一个小目标 →','new-plan','class="card"')}`, 'home'); }
function industryCards(query = '') { const result = industries.map((item,index) => ({...item,index})).filter(item => (exploreTab === '推荐' || item.category === exploreTab) && (item.title + item.subtitle).includes(query)); return result.length ? result.map(item => button(`<div class="row"><span class="bubble ${item.index === 1 || item.index === 2 ? 'orange' : ''}">${icon(item.icon)}</span><div class="grow"><h3>${item.title}</h3><p style="font-size:11px" class="muted">${item.subtitle}</p><small>${item.time ? esc(item.time) + " · 自主体验" : item.count + " · 示例关注量"}</small></div><span class="chevron">›</span></div>`,`industry:${item.index}`,'class="card"')).join('') : '<div class="empty">没有匹配的方向，试试其他关键词。</div>'; }
function explore() { return page(`<h2>探索</h2><div class="tabs">${['推荐','行业','技能','生活'].map(label => button(label,`filter:${label}`,`class="${label === exploreTab ? 'active' : ''}"`)).join('')}</div><label class="search">${icon('search')}<input id="explore-search" placeholder="搜索行业、技能或生活" aria-label="搜索方向"></label><h3 style="margin:20px 0 14px">你可能感兴趣的方向</h3><div id="industry-list">${industryCards()}</div>`, 'explore'); }
function industry() { const item = industries[selectedIndustry]; if (item.steps) return roadDetail(item); return page(`${header('行业详情')}<img class="banner" src="art.svg" alt="${item.title}主题插画"><div class="row"><h2 class="grow">${item.title}</h2>${button(icon('star'), 'favorite', `aria-label="${state.favorites.includes(selectedIndustry) ? '取消收藏' : '收藏'}" style="color:${state.favorites.includes(selectedIndustry) ? '#1450ff' : '#8c91a0'}"`)}</div><p><span class="tag">${item.category}</span> <span class="tag">职业</span> <span class="tag">推荐</span></p><p class="muted" style="font-size:13px;margin-top:12px">${item.body}</p><div class="stats"><div>${item.count}<small>关注</small></div><div>89<small>内容</small></div><div>4.8<small>评分</small></div></div><h3 style="margin-bottom:12px">热门内容</h3>${item.articles.map((title,index) => button(`<div class="row"><img class="thumb" style="filter:hue-rotate(${index * 16}deg)" src="art.svg" alt=""><div class="grow"><h3 style="font-size:13px">${title}</h3><small>${[2.3,4.1,1.7][index]}k 阅读 · ${[12,28,15][index]} 评论</small></div><span class="chevron">›</span></div>`,`article:${index}`,'class="card"')).join('')}${button('为这个方向新建计划 +','industry-plan','class="primary space"')}<p class="auth-note">内容与关注、阅读数据为本地演示资料</p>`); }
function plans() { return page(`<h1>计划</h1><div class="tabs">${['我的计划','推荐计划'].map(label => button(label,`plans-tab:${label}`,`class="${label === planTab ? 'active' : ''}"`)).join('')}</div><div class="hero"><h2>从现在开始<br>把想法变成行动</h2>${button('新建计划 +','new-plan','class="pill"')}<div class="hero-art"></div></div><div class="section-heading"><h3>${planTab}</h3><small>${state.plans.length} 个计划</small></div>${planTab === '我的计划' ? state.plans.map(planCard).join('') || '<div class="empty">还没有计划，从一个小目标开始吧。</div>' : industries.map((item,index) => button(`<h3>${item.title} · 7 天探索</h3><p class="muted">了解基础 → 尝试实践 → 记录感受</p><p class="text-button">使用这个模板 +</p>`,`template:${index}`,'class="card"')).join('')}`, 'plans'); }
function newPlan() { return page(`${header('新建计划')}<div class="stepper">${['基本信息','具体步骤','完成'].map((label,index) => `<div class="${draftStep >= index + 1 ? 'active' : ''}"><b>${index + 1}</b>${label}</div>`).join('')}</div><form id="plan-form">${draftStep === 1 ? `<label class="field"><span>计划名称</span><input name="title" maxlength="40" placeholder="例如：尝试新媒体方向" value="${esc(draft.title)}" required></label><div class="field"><span>选择分类</span><div class="chips">${['行业探索','技能提升','生活方式'].map(label => button(label,`category:${label}`,`class="pill ${draft.category === label ? 'selected' : ''}"`)).join('')}</div></div><div class="field"><span>计划时间</span><div class="date-range"><input type="date" name="start" aria-label="开始时间" value="${esc(draft.start)}" required><span>～</span><input type="date" name="end" aria-label="结束时间" value="${esc(draft.end)}" required></div></div><label class="field"><span>目标描述</span><textarea name="goal" maxlength="500" placeholder="简单描述你的目标和想要达成的结果...">${esc(draft.goal)}</textarea></label>` : draftStep === 2 ? `<h3>把目标拆成可行动的小步骤</h3><p class="muted">完成每个步骤后，进度会自动更新。</p>${draft.tasks.map((task,index) => `<label class="field"><span>步骤 ${index + 1} ${button('移除',`remove-draft-task:${index}`,'class="text-button"')}</span><input name="task-${index}" maxlength="80" value="${esc(task.title)}" placeholder="填写一个具体行动" required></label>`).join('')}${button('+ 添加步骤','add-draft-task','class="text-button"')}` : `<div class="card"><h2>${esc(draft.title)}</h2><p class="muted">${esc(draft.category)} · ${esc(draft.start)} ～ ${esc(draft.end)}</p><p class="space">${esc(draft.goal)}</p><ol class="plain-list">${draft.tasks.map(task => `<li>${esc(task.title)}</li>`).join('')}</ol></div><p class="muted">确认后将保存到「我的计划」。</p>`}<div id="plan-error" class="form-error" role="alert"></div><button class="primary space" type="submit">${draftStep === 3 ? '完成并创建计划' : '下一步'}</button>${draftStep > 1 ? button('上一步','previous-step','class="text-button" style="display:block;margin:12px auto"') : ''}</form>`); }
function planDetail() { const plan = state.plans.find(item => item.id === selectedPlan); if (!plan) return page(`${header('计划详情')}<p class="empty">计划不存在或已删除。</p>`); return page(`${header('计划详情')}<img class="banner" src="art.svg" alt="探索计划插画"><div class="row"><h2 class="grow">${esc(plan.title)}</h2><span class="status">${Model.progress(plan) === 100 ? '已完成' : '进行中'}</span></div><small>${esc(plan.start)} - ${esc(plan.end)}</small>${progress(plan)}<div class="tabs detail-tabs">${['任务','记录','资源'].map(label => button(label,`detail-tab:${label}`,`class="${detailTab === label ? 'active' : ''}"`)).join('')}</div>${detailTab === '任务' ? plan.tasks.map((task,index) => `<div class="task">${button(task.done ? '✓' : '',`toggle:${index}`,`class="check ${task.done ? 'done' : ''}" aria-label="${task.done ? '取消完成' : '完成'}：${esc(task.title)}" aria-pressed="${task.done}"`)}<div class="grow"><p>${esc(task.title)}</p><small>${task.done ? '已完成' : '未开始'}</small></div></div>`).join('') + button('+ 添加任务','add-task','class="text-button" style="width:100%;margin-top:15px"') : detailTab === '记录' ? recordCards(plan.id) + button('+ 写一条记录','write-record','class="primary space"') : `<div class="card"><h3>行动指南</h3><p class="muted">${esc(plan.goal || '每次只做一个小步骤，记录你的观察和感受。')}</p></div>${button('浏览行业资料 →','go:explore','class="card"')}`}${detailTab === '任务' ? planStoryPanel(plan) : ''}${button('删除计划','delete-plan','class="text-button danger" style="margin-top:26px"')}`); }
function stats() { return `<div class="stats card"><div>${state.plans.filter(plan => Model.progress(plan) < 100).length}<small>进行中计划</small></div><div>${state.plans.filter(plan => Model.progress(plan) === 100).length}<small>完成计划</small></div><div>${state.records.length}<small>记录</small></div></div>`; }
function profileHead() { return `<div class="profile-head"><div class="avatar" aria-hidden="true">👩🏻</div><div class="grow"><h3>${esc(state.name)}</h3><small>正在探索更多可能</small></div>${button('›','edit-name','class="chevron" aria-label="修改昵称"')}</div>`; }
function menus() { return `<div class="card menu">${[['star','我的收藏','favorites'],['book','我的课程','courses'],['note','成长报告','go:report'],['settings','设置','settings']].map(([glyph,label,action]) => button(`${icon(glyph)}${label}<span class="chevron">›</span>`,action)).join('')}</div>`; }
function recordCards(planId) { const records = state.records.filter(record => !planId || record.planId === planId); return records.length ? records.map(record => `<div class="card"><small>${esc(record.date)}</small><p class="record-text">${esc(record.text)}</p>${button('删除',`delete-record:${record.id}`,'class="text-button danger"')}</div>`).join('') : '<div class="empty">还没有记录<br>写下今天的小收获吧。</div>'; }
function profile(records) { return page(`${records ? header('记录') : '<h3>个人中心</h3>'}${profileHead()}${stats()}${records ? button('+ 记录今天的探索','write-record','class="primary"') + `<div class="space">${recordCards()}</div>` : ''}${menus()}`, 'profile'); }
function report() { const totalTasks = state.plans.reduce((total,plan) => total + plan.tasks.length,0); const doneTasks = state.plans.reduce((total,plan) => total + plan.tasks.filter(task => task.done).length,0); const values = [Math.min(100,Math.round(state.visits.length / industries.length * 100)), totalTasks ? Math.round(doneTasks / totalTasks * 100) : 0, Math.min(100,state.plans.filter(plan => plan.category === '生活方式').length * 25),Math.min(100,state.records.length * 10)]; const days = Math.max(1,Math.floor((Date.now() - new Date(state.joined).getTime()) / 86400000) + 1); return page(`${header('成长报告')}<p class="muted">你在路上，已经走了 <strong style="color:#161b28">${days}</strong> 天</p><div class="hero"><h3>阶段性总结</h3><p style="font-size:13px">你已探索 ${state.visits.length} 个方向，<br>完成 ${doneTasks} 个行动步骤。<br>每一个小行动，都在让未来更清晰。</p><div class="hero-art"></div></div><div class="card"><h3>你的探索偏好</h3><div class="rings">${['行业探索','技能提升','生活方式','自我认知'].map((label,index) => `<div class="ring-item"><div class="ring" style="--value:${values[index]};--ring-color:${['#1450ff','#ff623b','#25bf9a','#1450ff'][index]}"><span>${values[index]}%</span></div><small>${label}</small></div>`).join('')}</div><p class="auth-note">基于本机探索与行动记录，不是专业能力测评</p></div><div class="card"><h3>下一步建议</h3><ul class="suggestions"><li>继续深入了解你感兴趣的行业</li><li>尝试参与更多实践项目</li><li>定期回顾和调整计划</li></ul></div>${button('查看详细报告','full-report','class="primary space"')}`); }
function render() { app.innerHTML = ({welcome,login:() => auth(false),register:() => auth(true),home,explore,industry,plans,newplan:newPlan,detail:planDetail,records:() => profile(true),profile:() => profile(false),report,stories:storiesPage,story:storyPage}[route] || home)(); updateCodeButton(); }
function startPlan(title = '', category = '行业探索') { draft = {title,category,start:Model.today(),end:'',goal:'',tasks:[{title:'',done:false}]}; draftStep = 1; go('newplan'); }
function captureDraft() { const form = document.querySelector('#plan-form'); if (!form) return; const data = new FormData(form); if (draftStep === 1) ['title','start','end','goal'].forEach(key => draft[key] = String(data.get(key) || '').trim()); if (draftStep === 2) draft.tasks.forEach((task,index) => task.title = String(data.get(`task-${index}`) || '').trim()); }
function updateCodeButton() { const element = document.querySelector('#code-button'); if (!element) return; const seconds = Math.max(0,Math.ceil((codeUntil - Date.now()) / 1000)); element.disabled = seconds > 0; element.textContent = seconds ? `${seconds}秒后重试` : '获取验证码'; }
setInterval(updateCodeButton,1000);
document.addEventListener('input',event => { if (event.target.id === 'explore-search') document.querySelector('#industry-list').innerHTML = industryCards(event.target.value.trim()); });
document.addEventListener('click',event => {
    const element = event.target.closest('[data-action]'); if (!element) return;
    const [action,...parts] = element.dataset.action.split(':'); const value = parts.join(':');
    if (action === 'story') openStory(value);
    else if (action === 'story-return') returnFromStory();
    else if (action === 'story-save') { state.savedStories = state.savedStories.includes(selectedStory) ? state.savedStories.filter(id=>id!==selectedStory) : [...state.savedStories,selectedStory]; save(); element.textContent=state.savedStories.includes(selectedStory)?'已收藏':'收藏故事'; element.setAttribute('aria-pressed',String(state.savedStories.includes(selectedStory))); }
    else if (action === 'story-filter') { storyFilter=value; render(); }
    else if (action === 'story-help') showStoryHelp();
    else if (action === 'story-dismiss') { const plan=state.plans.find(p=>p.id===selectedPlan); if(plan) {state.dismissedStories[storyStageKey(plan)]=true;save();render();} }

    else if (action === 'road-plan') createRoadPlan();
    else if (action === 'go') go(value);
    else if (action === 'nav') { trail = []; route = value; render(); window.scrollTo(0,0); }
    else if (action === 'back') window.beforeBack();
    else if (action === 'close') modal.close();
    else if (action === 'guest') { state.session = true; save(); trail = []; route = 'home'; render(); }
    else if (action === 'login-mode') { loginMode = loginMode === 'code' ? 'password' : 'code'; render(); }
    else if (action === 'code') { const phone = document.querySelector('[name="phone"]').value; if (!/^1\d{10}$/.test(phone)) { document.querySelector('#auth-error').textContent = '请输入有效的 11 位手机号'; return; } codeUntil = Date.now() + 60000; updateCodeButton(); showModal('离线验证码', '<p>本版本不会发送短信。演示验证码为 <strong>123456</strong>，仅用于本机体验。</p>'); }
    else if (action === 'legal') showModal(value === 'terms' ? '用户协议（体验版）' : '隐私政策', '<p>本应用为离线原型，不提供真实账号、短信、课程购买或专业咨询服务。计划、昵称与记录仅保存在本机；卸载或清除数据会永久删除。请勿录入敏感个人信息。</p>');
    else if (action === 'industry') { selectedIndustry = Number(value); if (!state.visits.includes(selectedIndustry)) state.visits.push(selectedIndustry); save(); go('industry'); }
    else if (action === 'filter') { exploreTab = value; render(); }
    else if (action === 'favorite') { state.favorites = state.favorites.includes(selectedIndustry) ? state.favorites.filter(item => item !== selectedIndustry) : [...state.favorites,selectedIndustry]; save(); render(); }
    else if (action === 'article') { const item = industries[selectedIndustry]; showModal(item.articles[Number(value)], `<p>${item.body}</p><ol class="plain-list"><li>先了解岗位与实际工作内容，列出三个想验证的问题。</li><li>选择一个一周内能完成的小项目，亲手尝试。</li><li>记录过程中的兴趣、困难和收获，再决定是否继续。</li></ol><small>Before 本地入门资料 · 演示内容</small>${button('把想法变成计划','industry-plan','class="primary"')}`); }
    else if (action === 'industry-plan' || action === 'template') { if (modal.open) modal.close(); if (action === 'template') selectedIndustry = Number(value); if (industries[selectedIndustry].steps) { createRoadPlan(); } else { startPlan(`探索${industries[selectedIndustry].title}`,selectedIndustry === 3 ? '生活方式' : selectedIndustry === 0 ? '行业探索' : '技能提升'); } }
    else if (action === 'new-plan') startPlan();
    else if (action === 'plans-tab') { planTab = value; render(); }
    else if (action === 'category') { captureDraft(); draft.category = value; render(); }
    else if (action === 'previous-step') { captureDraft(); draftStep--; render(); }
    else if (action === 'add-draft-task') { captureDraft(); draft.tasks.push({title:'',done:false}); render(); }
    else if (action === 'remove-draft-task') { captureDraft(); if (draft.tasks.length === 1) { toast('请至少保留一个步骤'); return; } draft.tasks.splice(Number(value),1); render(); }
    else if (action === 'plan') { selectedPlan = value; detailTab = '任务'; go('detail'); }
    else if (action === 'detail-tab') { detailTab = value; render(); }
    else if (action === 'toggle') { const task = state.plans.find(plan => plan.id === selectedPlan).tasks[Number(value)]; task.done = !task.done; save(); render(); }
    else if (action === 'add-task') showModal('添加任务', '<form id="task-form"><input name="title" maxlength="80" placeholder="下一步想做什么？" aria-label="任务名称" required><button type="submit" class="primary">添加</button></form>');
    else if (action === 'write-record') showModal('记录这一步', '<form id="record-form"><textarea name="text" maxlength="2000" placeholder="今天尝试了什么？有什么发现？" aria-label="记录内容" required></textarea><button class="primary" type="submit">保存记录</button></form>');
    else if (action === 'delete-record') showModal('删除这条记录？', `<p>删除后无法恢复。</p>${button('确认删除',`confirm-record:${value}`,'class="primary"')}`);
    else if (action === 'confirm-record') { state.records = state.records.filter(record => record.id !== value); save(); modal.close(); render(); }
    else if (action === 'delete-plan') showModal('删除这个计划？', `<p>计划与任务会被删除，探索记录仍会保留。</p>${button('确认删除','confirm-delete','class="primary"')}`);
    else if (action === 'confirm-delete') { state.plans = state.plans.filter(plan => plan.id !== selectedPlan); save(); modal.close(); trail = []; route = 'plans'; render(); }
    else if (action === 'edit-name') showModal('修改昵称', `<form id="name-form"><input name="name" maxlength="20" value="${esc(state.name)}" aria-label="昵称" required><button type="submit" class="primary">保存</button></form>`);
    else if (action === 'favorites') showModal('我的收藏', state.favorites.length ? state.favorites.map(index => button(industries[index].title,`open-favorite:${index}`,'class="card"')).join('') : '<p class="muted">暂时没有收藏。在行业详情页点击星标即可收藏。</p>');
    else if (action === 'open-favorite') { selectedIndustry = Number(value); modal.close(); go('industry'); }
    else if (action === 'courses') showModal('我的课程', '<p>体验版不包含付费课程。你可以使用免费的行业入门资料开始探索。</p>' + button('查看入门资料','open-explore','class="primary"'));
    else if (action === 'open-explore') { modal.close(); go('explore'); }
    else if (action === 'notifications') showModal('消息提醒', `<p>你有 ${state.plans.filter(plan => Model.progress(plan) < 100).length} 个进行中的计划。今天也为目标迈出一小步吧。</p>`);
    else if (action === 'settings') showModal('设置', '<p>Before 1.0 · 离线体验版</p><p class="muted">数据仅保存在本机，不申请网络或通讯录权限。</p>' + button('隐私政策','legal:privacy','class="text-button"') + button('退出当前体验','logout','class="primary"'));
    else if (action === 'logout') { state.session = false; save(); modal.close(); trail = []; route = 'login'; render(); }
    else if (action === 'full-report') showModal('详细成长报告', `<p>探索方向：${state.visits.length} / ${industries.length}</p><p>计划总数：${state.plans.length}</p><p>完成计划：${state.plans.filter(plan => Model.progress(plan) === 100).length}</p><p>行动记录：${state.records.length}</p><p class="space muted">行业探索按浏览方向数计算；技能提升按任务完成率计算；生活方式按相关计划数量计算；自我认知按记录数量计算。此报告仅用于自我回顾。</p>`);
});
document.addEventListener('submit', async event => {
    event.preventDefault(); const form = event.target; const data = new FormData(form);
    if (form.id === 'story-response') {
        const response=String(data.get('response')||'').trim();
        if(!response) { toast('可以先不写，随时返回继续'); return; }
        const story=window.BeforeStories.find(item=>item.id===selectedStory);
        const planId=storyOrigin?.route==='detail' && state.plans.some(p=>p.id===storyOrigin.planId) ? storyOrigin.planId : null;
        const key=selectedStory+':'+(planId||'personal');
        const id='story-response:'+key;
        state.storyResponses[key]=response;
        const record={id,text:'读《'+story.title+'》之后：\n'+response,date:new Date().toLocaleString('zh-CN'),planId};
        const existing=state.records.findIndex(r=>r.id===id);
        if(existing>=0) state.records[existing]=record; else state.records.unshift(record);
        save(); toast(planId?'已保存到这个计划的记录':'已保存到我的记录');
    } else if (form.id === 'auth-form') {
        const phone = String(data.get('phone')); const credential = String(data.get('credential')); const error = document.querySelector('#auth-error');
        if (!/^1\d{10}$/.test(phone)) { error.textContent = '请输入有效的 11 位手机号'; return; }
        if (route === 'register' || loginMode === 'code') { if (codeUntil <= 0 || credential !== '123456') { error.textContent = '请先获取演示验证码，再输入 123456'; return; } }
        if (route === 'register') { const password = String(data.get('password')); if (password.length < 6 || password.length > 16 || !data.get('agree')) { error.textContent = '请设置 6–16 位密码并同意协议'; return; } state.localCredential = { phone, hash: await hashPassword(phone,password) }; }
        else if (loginMode === 'password' && (!state.localCredential || state.localCredential.phone !== phone || state.localCredential.hash !== await hashPassword(phone,credential))) { error.textContent = '本机账号或密码不正确；可使用演示验证码进入'; return; }
        state.session = true; save(); trail = []; route = 'home'; render();
    } else if (form.id === 'plan-form') {
        captureDraft(); const error = document.querySelector('#plan-error');
        if (draftStep === 1 && (!draft.title || !draft.start || !draft.end || draft.start > draft.end)) { error.textContent = !draft.title ? '请输入计划名称' : '请填写有效日期，结束日期不能早于开始日期'; return; }
        if (draftStep === 2) { const message = Model.validatePlan(draft); if (message) { error.textContent = message; return; } }
        if (draftStep < 3) { draftStep++; render(); } else { const message = Model.validatePlan(draft); if (message) { error.textContent = message; return; } draft.id = String(Date.now()); state.plans.push(draft); selectedPlan = draft.id; save(); draft = null; detailTab = '任务'; trail = ['plans']; route = 'detail'; render(); toast('计划已创建，开始第一步吧'); }
    } else if (form.id === 'task-form') { const title = String(data.get('title')).trim(); if (!title) return; state.plans.find(plan => plan.id === selectedPlan).tasks.push({title,done:false}); save(); modal.close(); render(); }
    else if (form.id === 'record-form') { const text = String(data.get('text')).trim(); if (!text) return; state.records.unshift({ id:String(Date.now()),text,date:new Date().toLocaleString('zh-CN'),planId:route === 'detail' ? selectedPlan : null }); save(); modal.close(); render(); toast('记录已保存'); }
    else if (form.id === 'name-form') { const name = String(data.get('name')).trim(); if (!name) return; state.name = name; save(); modal.close(); render(); }
});
async function hashPassword(phone,password) { if (!window.crypto?.subtle) { toast('当前环境不支持安全密码存储，请使用演示验证码'); throw new Error('Secure hashing unavailable'); } const bytes = new TextEncoder().encode(`before-local:${phone}:${password}`); const digest = await crypto.subtle.digest('SHA-256',bytes); return Array.from(new Uint8Array(digest),byte => byte.toString(16).padStart(2,'0')).join(''); }
render();

function storySection() {
 return `<div class="section-heading"><h3>99个小故事</h3>${button('查看全部 ›','go:stories')}</div><p class="muted story-caption">六个故事，六种看问题的角度。想看就看，不必读完才出发。</p>${storyCards(2, true)}`;
}
function storyCards(limit = window.BeforeStories.length, all = false) {
 const items=window.BeforeStories.filter(item=>all||storyFilter!=='已收藏'||state.savedStories.includes(item.id));
 return items.slice(0,limit).map(item => button(`<div class="story-cover ${item.color}"><span class="story-category">${esc(item.theme)}</span><span class="cover-line">${esc(item.cue)}</span><span class="cover-format">图文故事 · ${item.id}</span></div><div class="story-preview"><h3>${esc(item.title)}</h3><p class="muted">${esc(item.paragraphs[0])}</p><span class="text-button">阅读全文 →</span></div>`,`story:${item.id}`,'class="card story-card"')).join('') || '<p class="empty">还没有收藏。遇到喜欢的故事，可以先留起来。</p>';
}
function storiesPage() { return page(`${header('99个小故事')}<h2>别急着决定，先看一种可能</h2><p class="muted story-caption">已收录 ${window.BeforeStories.length} 篇 · 人物与情节为虚构</p><div class="tabs" aria-label="故事筛选">${['全部','已收藏'].map(label=>button(label,`story-filter:${label}`,`class="${storyFilter===label?'active':''}" aria-pressed="${storyFilter===label}"`)).join('')}</div>${storyCards()}`); }
function openStory(id) {
 if(!window.BeforeStories.some(item=>item.id===id)) return;
 if(modal.open) modal.close();
 storyOrigin={route,planId:selectedPlan,detailTab,industry:selectedIndustry,scrollY:window.scrollY||0};
 selectedStory=id;go('story');
}
function returnFromStory() {
 const origin=storyOrigin;storyOrigin=null;
 if(!origin) {route='stories';render();return;}
 route=origin.route;selectedPlan=origin.planId;detailTab=origin.detailTab;selectedIndustry=origin.industry;
 if(route==='detail'&&!state.plans.some(p=>p.id===selectedPlan)) route='plans';
 if(trail.at(-1)===origin.route) trail.pop();
 render();window.scrollTo(0,origin.scrollY);
}
function storyPage() {
 const item=window.BeforeStories.find(story=>story.id===selectedStory)||window.BeforeStories[0];
 const linkedPlan=storyOrigin?.route==='detail' ? state.plans.find(p=>p.id===storyOrigin.planId) : null;
 const responseKey=item.id+':'+(linkedPlan?.id||'personal');
 const related=industries.map((road,index)=>({road,index})).filter(({road})=>item.roadTitles.includes(road.title));
 const returnLabel=linkedPlan?'返回当前任务':storyOrigin?.route==='industry'?'返回这条道路':'返回继续浏览';
 return page(`${header('故事全文')}<article><div class="story-cover reader-cover ${item.color}"><span class="story-category">${esc(item.theme)}</span><span class="cover-line">${esc(item.cue)}</span><span class="cover-format">图文故事 · ${item.id}</span></div><div class="reader-meta"><span>${item.id} · ${esc(item.method)}</span>${button(state.savedStories.includes(item.id)?'已收藏':'收藏故事','story-save',`class="text-button" aria-pressed="${state.savedStories.includes(item.id)}"`)}</div><h1 class="reader-title">${esc(item.title)}</h1><p class="auth-note reader-note">虚构故事，不是用户案例或效果证明</p><div class="story-prose">${item.paragraphs.map(paragraph=>`<p>${esc(paragraph)}</p>`).join('')}</div><section class="method-note"><h3>把这个角度带走</h3><p>${esc(item.takeaway)}</p><details><summary>这个方法的边界</summary><p>${esc(item.boundary)}</p></details></section><h3 class="space">留给你的问题</h3><p class="story-body">${esc(item.question)}</p><form id="story-response"><label class="field"><span>${esc(item.actionQuestion)}</span><textarea name="response" maxlength="2000" placeholder="可选，写一句也可以。内容只保存在当前浏览器。">${esc(state.storyResponses[responseKey]||'')}</textarea></label><button class="primary" type="submit">${linkedPlan?'保存到这个计划的记录':'保存到我的记录'}</button></form>${!linkedPlan&&related.length?`<div class="space"><h3>也可以带着这个问题试一次</h3><p class="muted story-caption">以下是相关方向，不是故事中完整经历的复现。</p>${related.map(({road,index})=>button(esc(road.title)+' →',`industry:${index}`,'class="card"')).join('')}</div>`:''}</article><div class="story-return">${button(returnLabel,'story-return','class="primary"')}<small>不用写感想，也能直接返回。</small></div>`);
}
function storyStageKey(plan) {return plan.id+':'+plan.tasks.filter(t=>t.done).length;}
function planStoryPanel(plan) {
 const count=plan.tasks.filter(t=>t.done).length;
 const complete=plan.tasks.length>0&&count===plan.tasks.length;
 const method=complete?'M040':count===0?'M048':plan.roadTitle==='Unity 交互入门'?'M045':'M037';
 const story=window.BeforeStories.find(item=>item.id===method);
 const hidden=state.dismissedStories[storyStageKey(plan)];
 return `<section class="task-story space" aria-label="可选故事帮助">${button('卡住了？找一个看问题的角度','story-help','class="text-button"')}${hidden?'':`<p class="story-caption">${complete?'这次尝试结束了。继续、换一种试法，或者先停下，都可以。':count===0?'开始前有顾虑？可以先读个故事，也可以直接做任务。':'完成了一步，想停下来想一想，也可以。'}</p><div class="story-suggestion"><small>可选阅读 · ${story.id}</small><h3>${esc(story.title)}</h3>${button('读这个故事',`story:${story.id}`,'class="text-button"')}${button('这次先不看','story-dismiss','class="text-button"')}</div>`}</section>`;
}
function showStoryHelp() {
 const choices=[['M018','资料看了很多，还是不敢开始'],['M017','选择太多，不知道从哪里开始'],['M045','现在太累，这一步做不动'],['M037','担心试完没有收获'],['M040','已经投入了，不知道该不该继续']];
 showModal('你现在卡在哪里？',`<p class="muted story-caption">这里提供思考角度；如果卡在具体操作，需要查看对应教程或请教带领者。</p>${choices.map(([id,label])=>button(esc(label),`story:${id}`,'class="card"')).join('')}`);
}
function roadDetail(item) {
 return page(`${header('道路选择')}<span class="tag">${esc(item.category)} · 微体验</span><h1>${esc(item.title)}</h1><p class="muted story-body">${esc(item.body)}</p><div class="card"><h3>这次需要什么</h3><p>预计时间：${esc(item.time)}</p><p>准备：${esc(item.needs)}</p><p>留下：${esc(item.result)}</p><small>这些步骤是待验证草案；可以暂停，也可以只做第一步。</small></div><h3>今天可以这样试</h3><ol class="road-steps">${item.steps.map(step=>`<li>${esc(step)}</li>`).join('')}</ol><div class="card"><h3>体验后问问自己</h3><p>${esc(item.question)}</p><p class="muted">继续尝试、换个方向、暂时停下，都可以。把感受写进计划中的「记录」。</p></div>${button('把这次小尝试加入计划','road-plan','class="primary"')}<p class="auth-note">编辑设计的体验任务，尚待内测验证；不用于判断职业适配度。</p>`);
}
function createRoadPlan() {
 const item=industries[selectedIndustry];
 const existing=state.plans.find(plan=>plan.roadTitle===item.title && Model.progress(plan)<100);
 if(existing) {selectedPlan=existing.id;detailTab='任务';go('detail');toast('已打开这个方向的进行中计划');return;}
 const plan={id:'road-'+Date.now(),roadTitle:item.title,title:item.title+' · 第一次尝试',category:item.category==='生活'?'生活方式':item.category==='行业'?'行业探索':'技能提升',start:Model.today(),end:Model.today(),goal:item.result+'。复盘：'+item.question,tasks:item.steps.map(title=>({title,done:false}))};
 state.plans.push(plan);selectedPlan=plan.id;detailTab='任务';save();go('detail');toast('已加入计划，可随时暂停');
}
