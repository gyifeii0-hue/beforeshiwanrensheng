(function (root) {
    const key = 'before.v1';
    const today = () => new Date().toLocaleDateString('en-CA');
    const seed = () => ({ version: 1, name: '小雨', joined: today(), session: false, favorites: [], records: [], visits: [], plans: [
        { id: 'media', title: '尝试新媒体方向', category: '行业探索', start: today(), end: '2026-12-31', goal: '了解新媒体行业，完成自己的第一份作品集。', tasks: [{ title: '了解行业基础知识', done: true }, { title: '参加相关社群或活动', done: true }, { title: '制作个人作品集', done: false }, { title: '投递实习或项目', done: false }, { title: '复盘这次探索', done: false }] },
        { id: 'study', title: '考研学习计划', category: '技能提升', start: today(), end: '2026-12-31', goal: '建立持续学习习惯。', tasks: [{ title: '制定复习范围', done: true }, { title: '完成基础复习', done: false }, { title: '整理错题', done: false }, { title: '模拟练习', done: false }, { title: '总结与复盘', done: false }] }
    ] });
    const progress = plan => plan.tasks.length ? Math.round(plan.tasks.filter(task => task.done).length / plan.tasks.length * 100) : 0;
    const validatePlan = plan => !plan.title.trim() ? '请输入计划名称' : !plan.start || !plan.end ? '请选择开始与结束日期' : plan.start > plan.end ? '结束日期不能早于开始日期' : !plan.tasks.length || plan.tasks.some(task => !task.title.trim()) ? '请至少填写一个完整步骤' : '';
    const escape = value => String(value).replace(/[&<>"']/g, token => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[token]));
    const api = { key, seed, progress, validatePlan, escape, today };
    if (typeof module !== 'undefined') module.exports = api;
    root.BeforeModel = api;
})(typeof window === 'undefined' ? globalThis : window);
