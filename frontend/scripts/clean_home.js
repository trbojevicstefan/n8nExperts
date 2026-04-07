import fs from 'fs';

const path = 'src/pages/Home.tsx';
let content = fs.readFileSync(path, 'utf8');

const heroActionsRe = /const heroActions = user[\s\S]*?: homeContent\.hero\.actions;/g;
content = content.replace(heroActionsRe, 'const heroActions = homeContent.hero.actions;');

const homeRailRe = /const homeRail = user[\s\S]*?(?:\{\s*title: "Start with the side of the marketplace that matches your goal\.",)/g;

content = content.replace(homeRailRe, 'const homeRail = {\n    title: "Start with the side of the marketplace that matches your goal.",');

fs.writeFileSync(path, content, 'utf8');
console.log('done');
