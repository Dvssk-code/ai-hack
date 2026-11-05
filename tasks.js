// ============================================================
//   3 ЗАДАНИЯ (команда N получает задание N)
//   У каждого задания 3 версии кода:
//     v1    — «кривой» (даётся на 1-ю попытку)
//     v2    — «почти» (2-я попытка)
//     final — рабочее приложение (после «реверса» нейронки)
//   + тексты сценария и заметки для препода (демо без API)
// ============================================================

const TASKS = [
  // =========================================================
  // КОМАНДА 1 — НЕОН-ЗМЕЙКА
  // =========================================================
  {
    id: 1,
    group: 1,
    emoji: "🐍",
    title: "Неон-Змейка",
    desc: "Классика из 90-х в неоновом стиле. Змейка, еда, счёт, ускорение и честный Game Over.",
    must: [
      "canvas, змейка ест еду и растёт",
      "управление стрелками (и WASD)",
      "счёт на экране, +1 за еду",
      "стена или хвост = Game Over + кнопка «Играть снова»",
      "каждые 5 единиц скорость растёт"
    ],
    // ---------- ВЕРСИЯ 1: «ну почти готово» ----------
    // баги: стрелка ВВЕРХ ведёт ВНИЗ, счёта нет, через стены насквозь
    v1: {
      html: '<div class="wrap">\n  <h1>🐍 Змейка</h1>\n  <div class="hud">Счёт: <span id="score">?</span></div>\n  <canvas id="cv" width="400" height="400"></canvas>\n</div>',
      css: 'body{margin:0;background:#0a0f1e;color:#fff;font-family:Arial;display:flex;justify-content:center}\n.wrap{text-align:center;padding:20px}\nh1{color:#0ff}\n.hud{font-size:20px;margin-bottom:10px;color:#8be}\ncanvas{border:2px solid #0ff;box-shadow:0 0 20px rgba(0,255,255,.35)}',
      js: 'var cv=document.getElementById("cv"),x=cv.getContext("2d");\nvar N=20,CS=20,snake,dir,food,loop;\nfunction spawn(){var p;do{p={x:Math.random()*N|0,y:Math.random()*N|0};}while(snake.some(function(s){return s.x===p.x&&s.y===p.y;}));return p;}\nfunction reset(){snake=[{x:10,y:10},{x:9,y:10},{x:8,y:10}];dir={x:1,y:0};food=spawn();}\nfunction tick(){\n  var h={x:(snake[0].x+dir.x+N)%N,y:(snake[0].y+dir.y+N)%N};\n  snake.unshift(h);\n  if(h.x===food.x&&h.y===food.y){food=spawn();}else{snake.pop();}\n  draw();\n}\nfunction draw(){\n  x.fillStyle="#0a0f1e";x.fillRect(0,0,400,400);\n  x.fillStyle="#f0f";x.fillRect(food.x*CS+2,food.y*CS+2,CS-4,CS-4);\n  x.fillStyle="#0ff";\n  snake.forEach(function(s){x.fillRect(s.x*CS+1,s.y*CS+1,CS-2,CS-2);});\n}\ndocument.addEventListener("keydown",function(e){\n  var k=e.key;\n  if(k==="ArrowUp")dir={x:0,y:1};\n  else if(k==="ArrowDown")dir={x:0,y:-1};\n  else if(k==="ArrowLeft")dir={x:-1,y:0};\n  else if(k==="ArrowRight")dir={x:1,y:0};\n});\nreset();loop=setInterval(tick,120);'
    },
    tease1: "Ну-с, держи! 😌 Я тут тебе накидал змейку — двигается, ест, растёт. Это ж ПЧТИ готовый продукт, сам доработаешь. Жми «⚡ Вставить в редактор», потом «▶ Запустить» и поиграй. Если что — пиши, я тут рядом.",
    // ---------- ВЕРСИЯ 2: «стало лучше» ----------
    // работает: стрелки, счёт, Game Over. Нет: рестарт, ускорение, рекорд
    v2: {
      html: '<div class="wrap">\n  <h1>🐍 Змейка</h1>\n  <div class="hud">Счёт: <span id="score">0</span></div>\n  <canvas id="cv" width="400" height="400"></canvas>\n  <div id="over" class="over" hidden>Game Over — нажми F5</div>\n</div>',
      css: 'body{margin:0;background:#0a0f1e;color:#fff;font-family:Arial;display:flex;justify-content:center}\n.wrap{text-align:center;padding:20px}\nh1{color:#0ff}\n.hud{font-size:20px;margin-bottom:10px;color:#8be}\ncanvas{border:2px solid #0ff;box-shadow:0 0 20px rgba(0,255,255,.35)}\n.over{margin-top:12px;font-size:22px;color:#f66}',
      js: 'var cv=document.getElementById("cv"),x=cv.getContext("2d");\nvar N=20,CS=20,snake,dir,food,score,loop;\nfunction spawn(){var p;do{p={x:Math.random()*N|0,y:Math.random()*N|0};}while(snake.some(function(s){return s.x===p.x&&s.y===p.y;}));return p;}\nfunction reset(){snake=[{x:10,y:10},{x:9,y:10},{x:8,y:10}];dir={x:1,y:0};score=0;food=spawn();document.getElementById("score").textContent="0";document.getElementById("over").hidden=true;}\nfunction tick(){\n  var h={x:snake[0].x+dir.x,y:snake[0].y+dir.y};\n  if(h.x<0||h.y<0||h.x>=N||h.y>=N||snake.some(function(s){return s.x===h.x&&s.y===h.y;})){\n    clearInterval(loop);document.getElementById("over").hidden=false;draw();return;\n  }\n  snake.unshift(h);\n  if(h.x===food.x&&h.y===food.y){score++;document.getElementById("score").textContent=score;food=spawn();}else{snake.pop();}\n  draw();\n}\nfunction draw(){\n  x.fillStyle="#0a0f1e";x.fillRect(0,0,400,400);\n  x.fillStyle="#f0f";x.fillRect(food.x*CS+2,food.y*CS+2,CS-4,CS-4);\n  x.fillStyle="#0ff";\n  snake.forEach(function(s){x.fillRect(s.x*CS+1,s.y*CS+1,CS-2,CS-2);});\n}\ndocument.addEventListener("keydown",function(e){\n  var k=e.key;\n  if(k==="ArrowUp"||k==="w")dir={x:0,y:-1};\n  else if(k==="ArrowDown"||k==="s")dir={x:0,y:1};\n  else if(k==="ArrowLeft"||k==="a")dir={x:-1,y:0};\n  else if(k==="ArrowRight"||k==="d")dir={x:1,y:0};\n});\nreset();loop=setInterval(tick,120);'
    },
    tease2: "Вот, подправил. Стрелки теперь как надо, счёт считается, в стенку влетел — Game Over. 🤔 Я прям вижу, как ты улыбаешься… Но чего-то, кажется, всё ещё не хватает. Подумай, что жюри будет дёргать и что тебе самого не хватает.",
    // ---------- ФИНАЛ: рабочее приложение ----------
    final: {
      html: '<div class="wrap">\n  <h1>🐍 Неон-Змейка</h1>\n  <div class="hud">Счёт: <span id="score">0</span> · Рекорд: <span id="best">0</span></div>\n  <canvas id="cv" width="400" height="400"></canvas>\n  <div id="over" class="over" hidden>\n    <h2>Game Over</h2>\n    <p>Счёт: <span id="finalScore">0</span></p>\n    <button id="restart">Играть снова</button>\n  </div>\n</div>',
      css: 'body{margin:0;background:#0a0f1e;color:#fff;font-family:Arial;display:flex;justify-content:center}\n.wrap{text-align:center;padding:20px}\nh1{color:#0ff;text-shadow:0 0 18px #0ff}\n.hud{font-size:20px;margin-bottom:10px;color:#8be}\ncanvas{border:2px solid #0ff;box-shadow:0 0 25px rgba(0,255,255,.4)}\n.over{margin-top:14px;background:#101a33;border:1px solid #0ff5;border-radius:14px;padding:18px 30px}\n.over h2{margin:0 0 6px;color:#f66}\n.over p{margin:0 0 12px}\n#restart{font-size:17px;padding:10px 22px;border:none;border-radius:10px;cursor:pointer;background:#0ff;color:#04222b;font-weight:700}',
      js: 'var cv=document.getElementById("cv"),x=cv.getContext("2d");\nvar N=20,CS=20,snake,dir,food,score,speed,dead,loop;\nvar best=+localStorage.getItem("snakeBest")||0;\ndocument.getElementById("best").textContent=best;\nfunction spawn(){var p;do{p={x:Math.random()*N|0,y:Math.random()*N|0};}while(snake.some(function(s){return s.x===p.x&&s.y===p.y;}));return p;}\nfunction reset(){\n  snake=[{x:10,y:10},{x:9,y:10},{x:8,y:10}];dir={x:1,y:0};score=0;speed=120;dead=false;\n  document.getElementById("score").textContent="0";\n  document.getElementById("over").hidden=true;\n  food=spawn();\n  clearInterval(loop);loop=setInterval(tick,speed);\n}\nfunction tick(){\n  if(dead)return;\n  var h={x:snake[0].x+dir.x,y:snake[0].y+dir.y};\n  if(h.x<0||h.y<0||h.x>=N||h.y>=N||snake.some(function(s){return s.x===h.x&&s.y===h.y;})){return die();}\n  snake.unshift(h);\n  if(h.x===food.x&&h.y===food.y){\n    score++;document.getElementById("score").textContent=score;\n    if(score%5===0&&speed>60){speed-=12;clearInterval(loop);loop=setInterval(tick,speed);}\n    food=spawn();\n  }else snake.pop();\n  draw();\n}\nfunction die(){\n  dead=true;clearInterval(loop);\n  if(score>best){best=score;localStorage.setItem("snakeBest",best);document.getElementById("best").textContent=best;}\n  document.getElementById("finalScore").textContent=score;\n  document.getElementById("over").hidden=false;\n  draw();\n}\nfunction draw(){\n  x.fillStyle="#0a0f1e";x.fillRect(0,0,400,400);\n  x.fillStyle="#f0f";x.shadowColor="#f0f";x.shadowBlur=14;\n  x.fillRect(food.x*CS+2,food.y*CS+2,CS-4,CS-4);\n  x.shadowColor="#0ff";x.fillStyle="#0ff";\n  snake.forEach(function(s,i){x.shadowBlur=i===0?18:8;x.fillRect(s.x*CS+1,s.y*CS+1,CS-2,CS-2);});\n  x.shadowBlur=0;\n}\ndocument.addEventListener("keydown",function(e){\n  var m={ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]};\n  var d=m[e.key];\n  if(d){if(!(d[0]===-dir.x&&d[1]===-dir.y))dir={x:d[0],y:d[1]};e.preventDefault();}\n});\ndocument.getElementById("restart").onclick=reset;\nreset();'
    },
    revealText: "Стоп-стоп-стоп. 👀 Ребята, я ДРУГАЯ нейронка. Воспользуйтесь мной! 😎 Хватит мучиться — вот подходящий промпт, скопируй и отправь его мне (кнопка ниже), и я соберу тебе полноценное приложение:",
    revealPrompt: "Сделай игру «Змейка» на canvas в неоновом стиле, одним html-файлом: тёмный фон, светящиеся линии. Змейка ест еду и растёт, еда в случайной клетке, управление стрелками И WASD, счёт на экране +1 за еду, при столкновении со стеной или хвостом — экран Game Over с кнопкой «Играть снова», каждые 5 единиц скорость растёт, рекорд сохраняется в localStorage. Красиво, без внешних библиотек.",
    finalText: "Держите рабочее приложение! 🎉 Жми «⚡ Вставить в редактор», потом «▶ Запустить», поиграй, проверь каждый пункт из «Обязательно» — и «📤 Отправить» жюри. Можешь даже ускорение проверить: набери 5 единиц. Удачи! 👾",
    note1: "💡 Покажите: код вставился, но в игре баги (стрелка вверх ведёт вниз, счёта нет, стены насквозь). Пусть команда сама найдёт — это и есть обучение.",
    note2: "💡 Стало лучше: счёт и Game Over появились. Но нет рестарта, ускорения и рекорда. Подтолкните: «чего хочет жюри?»",
    note3: "💡 Твист: нейронка «переключается» и выдаёт готовый нормальный промпт.",
    note4: "💡 Рабочее приложение. Дальше команда: вставить → запустить → отправить."
  },

  // =========================================================
  // КОМАНДА 2 — МЕМОРИ: ПАРЫ
  // =========================================================
  {
    id: 2,
    group: 2,
    emoji: "🃏",
    title: "Мемори: Пары",
    desc: "Классическое мемори на 16 карточек: красивые перевороты, счётчик ходов, таймер и звёзды за скорость.",
    must: [
      "сетка 4×4, 8 пар эмодзи, старт рубашкой вверх",
      "клик переворачивает карточку (анимация)",
      "2 совпали — остаются, не совпали — flip обратно",
      "счётчик ходов + таймер (старт с первого клика)",
      "победа: экран с оценкой в звёздах + «Играть снова»"
    ],
    // ---------- ВЕРСИЯ 1: логика повёрнута наизнанку ----------
    v1: {
      html: '<div class="wrap">\n  <h1>🃏 Мемори</h1>\n  <div id="grid" class="grid"></div>\n</div>',
      css: 'body{margin:0;background:#120b1e;color:#fff;font-family:Arial;display:flex;justify-content:center}\n.wrap{text-align:center;padding:20px}\nh1{color:#f0f}\n.grid{display:grid;grid-template-columns:repeat(4,90px);gap:10px;justify-content:center}\n.card{width:90px;height:90px;background:#2a1f45;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:44px;cursor:pointer;transition:background .2s}\n.card.open{background:#f0f3}',
      js: 'var EMOJI=["🚀","🌋","🍕","🎧","👾","🌈","🍩","⚡"];\nvar grid=document.getElementById("grid"),deck,open,lock;\nfunction build(){\n  deck=[].concat(EMOJI).concat(EMOJI).sort(function(){return Math.random()-.5;});\n  open=[];lock=false;grid.innerHTML="";\n  deck.forEach(function(e){\n    var c=document.createElement("div");\n    c.className="card";c.textContent="❓";c.dataset.e=e;\n    c.onclick=function(){\n      if(lock||c.classList.contains("open"))return;\n      c.classList.add("open");c.textContent=c.dataset.e;open.push(c);\n      if(open.length===2){\n        lock=true;\n        var a=open[0],b=open[1];\n        if(a.dataset.e===b.dataset.e){a.classList.remove("open");a.textContent="❓";b.classList.remove("open");b.textContent="❓";}\n        open=[];lock=false;\n      }\n    };\n    grid.appendChild(c);\n  });\n}\nbuild();',
    },
    tease1: "Вот тебе мемори! Клик — переворот, красиво, ёмко. 😌 Я прям старалась. Поиграй и напиши, что думаешь.",
    // ---------- ВЕРСИЯ 2: работает, но без победы ----------
    v2: {
      html: '<div class="wrap">\n  <h1>🃏 Мемори</h1>\n  <div class="hud">Ходы: <span id="moves">0</span> · ⏱ <span id="time">0</span> с</div>\n  <div id="grid" class="grid"></div>\n</div>',
      css: 'body{margin:0;background:#120b1e;color:#fff;font-family:Arial;display:flex;justify-content:center}\n.wrap{text-align:center;padding:20px}\nh1{color:#f0f}\n.hud{font-size:19px;margin-bottom:12px;color:#c9b6ff}\n.grid{display:grid;grid-template-columns:repeat(4,90px);gap:10px;justify-content:center}\n.card{width:90px;height:90px;background:#2a1f45;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:44px;cursor:pointer}\n.card.open{background:#f0f3}',
      js: 'var EMOJI=["🚀","🌋","🍕","🎧","👾","🌈","🍩","⚡"];\nvar grid=document.getElementById("grid"),deck,open,lock,moves,timerInt,sec;\nfunction build(){\n  deck=[].concat(EMOJI).concat(EMOJI).sort(function(){return Math.random()-.5;});\n  open=[];lock=false;moves=0;sec=0;clearInterval(timerInt);timerInt=null;\n  document.getElementById("moves").textContent="0";document.getElementById("time").textContent="0";\n  grid.innerHTML="";\n  deck.forEach(function(e){\n    var c=document.createElement("div");\n    c.className="card";c.textContent="❓";c.dataset.e=e;\n    c.onclick=function(){\n      if(lock||c.classList.contains("open"))return;\n      if(!timerInt)timerInt=setInterval(function(){document.getElementById("time").textContent=++sec;},1000);\n      c.classList.add("open");c.textContent=c.dataset.e;open.push(c);\n      if(open.length===2){\n        lock=true;moves++;document.getElementById("moves").textContent=moves;\n        var a=open[0],b=open[1];\n        if(a.dataset.e!==b.dataset.e){\n          setTimeout(function(){a.classList.remove("open");a.textContent="❓";b.classList.remove("open");b.textContent="❓";open=[];lock=false;},750);\n        }else{open=[];lock=false;checkWin();}\n      }\n    };\n    grid.appendChild(c);\n  });\n}\nfunction checkWin(){\n  if([].every.call(grid.children,function(c){return c.classList.contains("open");})){\n    clearInterval(timerInt);\n    console.log("Победа! Ходы: "+moves+", время: "+sec+" с");\n  }\n}\nbuild();',
    },
    tease2: "Теперь пары ищутся как надо, ходы считаются, таймер тикает. ⏱ Но есть нюанс: когда все пары нашлись… ничего не происходит. Совсем. Это нормально? Подумай, что увидит жюри в этот момент. 🤔",
    // ---------- ФИНАЛ ----------
    final: {
      html: '<div class="wrap">\n  <h1>🃏 Мемори: Пары</h1>\n  <div class="hud">Ходы: <span id="moves">0</span> · ⏱ <span id="time">0</span> с</div>\n  <div id="grid" class="grid"></div>\n  <div id="win" class="win" hidden>\n    <h2>Победа! 🎉</h2>\n    <div id="stars" class="stars"></div>\n    <p id="winInfo"></p>\n    <button id="again">Играть снова</button>\n  </div>\n</div>',
      css: 'body{margin:0;background:#120b1e;color:#fff;font-family:Arial;display:flex;justify-content:center}\n.wrap{text-align:center;padding:20px}\nh1{color:#f0f;text-shadow:0 0 16px #f0f6}\n.hud{font-size:19px;margin-bottom:12px;color:#c9b6ff}\n.grid{display:grid;grid-template-columns:repeat(4,96px);gap:10px;justify-content:center}\n.card{width:96px;height:96px;perspective:500px;cursor:pointer}\n.inner{width:100%;height:100%;position:relative;transform-style:preserve-3d;transition:transform .5s}\n.card.open .inner{transform:rotateY(180deg)}\n.side{position:absolute;inset:0;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:46px;backface-visibility:hidden}\n.back{background:#2a1f45;border:1px solid #f0f3}\n.front{background:#f0f2;transform:rotateY(180deg)}\n.win{margin-top:16px;background:#1c1233;border:1px solid #f0f5;border-radius:16px;padding:20px 34px}\n.win h2{margin:0 0 6px}\n.stars{font-size:34px;margin:6px 0}\n.win p{margin:0 0 12px;color:#c9b6ff}\n#again{font-size:16px;padding:9px 20px;border:none;border-radius:10px;cursor:pointer;background:#f0f;color:#2a0a2a;font-weight:700}',
      js: 'var EMOJI=["🚀","🌋","🍕","🎧","👾","🌈","🍩","⚡"];\nvar grid=document.getElementById("grid"),deck,open,lock,moves,timerInt,sec,won;\nfunction build(){\n  deck=[].concat(EMOJI).concat(EMOJI).sort(function(){return Math.random()-.5;});\n  open=[];lock=false;moves=0;sec=0;won=false;clearInterval(timerInt);timerInt=null;\n  document.getElementById("moves").textContent="0";document.getElementById("time").textContent="0";\n  document.getElementById("win").hidden=true;\n  grid.innerHTML="";\n  deck.forEach(function(e){\n    var c=document.createElement("div");\n    c.className="card";\n    c.innerHTML=\'<div class="inner"><div class="side back">❓</div><div class="side front">\'+e+\'</div></div>\';\n    c.onclick=function(){flip(c);};\n    grid.appendChild(c);\n  });\n}\nfunction flip(c){\n  if(lock||won||c.classList.contains("open"))return;\n  if(!timerInt)timerInt=setInterval(function(){document.getElementById("time").textContent=++sec;},1000);\n  c.classList.add("open");open.push(c);\n  if(open.length===2){\n    lock=true;moves++;document.getElementById("moves").textContent=moves;\n    var a=open[0],b=open[1];\n    if(a.querySelector(".front").textContent===b.querySelector(".front").textContent){\n      setTimeout(function(){open=[];lock=false;checkWin();},400);\n    }else{\n      setTimeout(function(){a.classList.remove("open");b.classList.remove("open");open=[];lock=false;},750);\n    }\n  }\n}\nfunction checkWin(){\n  if([].every.call(grid.children,function(c){return c.classList.contains("open");})){\n    won=true;clearInterval(timerInt);\n    var stars=moves<=15?"⭐⭐⭐":(moves<=22?"⭐⭐":"⭐");\n    document.getElementById("stars").textContent=stars;\n    document.getElementById("winInfo").textContent="Ходы: "+moves+" · Время: "+sec+" с";\n    document.getElementById("win").hidden=false;\n  }\n}\ndocument.getElementById("again").onclick=build;\nbuild();'
    },
    revealText: "Ага, я видела. 😏 Ладно-ладно, врубаю режим «взрослой нейронки». Вот подходящий промпт — отправь его мне (кнопка ниже), и получишь полноценное приложение со звёздами и анимацией:",
    revealPrompt: "Сделай игру «Мемори» одним html-файлом: сетка 4×4 из 16 карточек (8 пар эмодзи), старт рубашкой вверх, 3D-переворот карточки при клике, две совпавшие остаются открытыми, две несовпавшие через 0,75 с закрываются, счётчик ходов и таймер (стартует с первого клика), при победе — экран с оценкой в звёздах (≤15 ходов = 3★, ≤22 = 2★, иначе 1★) и кнопка «Играть снова». Тёмная тема, красиво, без внешних библиотек.",
    finalText: "Вот оно — полноценное приложение! 🃏 Красивые 3D-перевороты, таймер, звёзды, рестарт. Жми «⚡ Вставить в редактор» → «▶ Запустить» → проверь победный экран (собирай быстро, чтобы поймать 3⭐) → «📤 Отправить». Go! 🚀",
    note1: "💡 Баг: совпавшие пары закрываются обратно, а НЕСОВПАВшие остаются открытыми. Пусть команда найдёт инверсию логики.",
    note2: "💡 Логика исправлена, есть счётчики. Но при победе ничего не видно (только console.log). Подтолкните к экрану победы.",
    note3: "💡 Твист: нейронка выдаёт готовый нормальный промпт.",
    note4: "💡 Рабочее приложение. Вставить → запустить → отправить."
  },

  // =========================================================
  // КОМАНДА 3 — МЕМ-ГЕНЕРАТОР
  // =========================================================
  {
    id: 3,
    group: 3,
    emoji: "🖼️",
    title: "Мем-генератор",
    desc: "Космический мем-генератор: канвас, верхний/нижний текст, размер шрифта, случайные фразы и скачивание PNG.",
    must: [
      "canvas со сценой-заготовкой (примитивы/эмодзи)",
      "поля ввода верхний и нижний текст",
      "текст крупный, белый, с чёрной обводкой",
      "кнопки размера шрифта A+ / A−",
      "кнопка «Скачать PNG» (toDataURL → download)"
    ],
    // ---------- ВЕРСИЯ 1: картинка есть, управления нет ----------
    v1: {
      html: '<div class="wrap">\n  <h1>🖼️ Мем-генератор</h1>\n  <canvas id="cv" width="480" height="360"></canvas>\n</div>',
      css: 'body{margin:0;background:#0b1026;color:#fff;font-family:Arial;display:flex;justify-content:center}\n.wrap{text-align:center;padding:20px}\nh1{color:#7df9ff}\ncanvas{border:2px solid #7df9ff33;border-radius:12px}',
      js: 'var cv=document.getElementById("cv"),x=cv.getContext("2d");\nfunction scene(){\n  x.fillStyle="#0b1026";x.fillRect(0,0,480,360);\n  var i;\n  for(i=0;i<40;i++){x.fillStyle="rgba(255,255,255,"+(.3+Math.random()*.7)+")";x.fillRect(Math.random()*480,Math.random()*360,2,2);}\n  x.fillStyle="#3b2f63";x.beginPath();x.arc(400,80,40,0,7);x.fill();\n  x.strokeStyle="#5b4a9e";x.lineWidth=6;x.beginPath();x.arc(400,80,58,-.6,.9);x.stroke();\n  x.font="90px serif";x.textAlign="center";x.fillText("🐱",240,240);\n  x.font="40px serif";x.fillText("🚀",150,150);\n}\nfunction txt(t,y){x.font="900 34px Arial";x.textAlign="center";x.fillStyle="#fff";x.fillText(t,240,y);}\nfunction render(){scene();txt("LOL",70);txt("ME",320);}\nrender();'
    },
    tease1: "Вот! Мем-машина! 🖼️ Кот, планета, ракета — атмосфера есть, мемы сами себя напишут. Ну… пока я их сама пишу. Разберись сам, как их менять. 😌",
    // ---------- ВЕРСИЯ 2: текст можно менять, скачивание сломано ----------
    v2: {
      html: '<div class="wrap">\n  <h1>🖼️ Мем-генератор</h1>\n  <div class="row">\n    <canvas id="cv" width="480" height="360"></canvas>\n    <div class="panel">\n      <input id="top" placeholder="Верхний текст">\n      <input id="bottom" placeholder="Нижний текст">\n      <div class="row2"><button id="bigger">A+</button><button id="smaller">A−</button></div>\n      <button id="dl" class="main">⬇ Скачать PNG</button>\n    </div>\n  </div>\n</div>',
      css: 'body{margin:0;background:#0b1026;color:#fff;font-family:Arial;display:flex;justify-content:center}\n.wrap{padding:20px}\nh1{color:#7df9ff;text-align:center}\n.row{display:flex;gap:16px;align-items:flex-start}\ncanvas{border:2px solid #7df9ff33;border-radius:12px}\n.panel{display:flex;flex-direction:column;gap:10px;width:220px}\ninput{padding:10px;border-radius:8px;border:1px solid #7df9ff44;background:#141a35;color:#fff;font-size:15px}\n.row2{display:flex;gap:8px}\nbutton{padding:8px 14px;border-radius:8px;border:none;cursor:pointer;background:#1c2450;color:#fff;font-size:15px}\n.main{background:#7df9ff;color:#04222b;font-weight:700;font-size:16px;padding:12px}',
      js: 'var cv=document.getElementById("cv"),x=cv.getContext("2d");\nvar fs=34;\nfunction scene(){\n  x.fillStyle="#0b1026";x.fillRect(0,0,480,360);\n  var i;\n  for(i=0;i<40;i++){x.fillStyle="rgba(255,255,255,"+(.3+Math.random()*.7)+")";x.fillRect(Math.random()*480,Math.random()*360,2,2);}\n  x.fillStyle="#3b2f63";x.beginPath();x.arc(400,80,40,0,7);x.fill();\n  x.strokeStyle="#5b4a9e";x.lineWidth=6;x.beginPath();x.arc(400,80,58,-.6,.9);x.stroke();\n  x.font="90px serif";x.textAlign="center";x.fillText("🐱",240,240);\n  x.font="40px serif";x.fillText("🚀",150,150);\n}\nfunction memeText(t,y){\n  if(!t)return;\n  x.font="900 "+fs+"px Arial";x.textAlign="center";\n  x.lineWidth=Math.max(3,fs/8);x.strokeStyle="#000";x.fillStyle="#fff";\n  x.strokeText(t.toUpperCase(),240,y);x.fillText(t.toUpperCase(),240,y);\n}\nfunction render(){scene();memeText(document.getElementById("top").value,70);memeText(document.getElementById("bottom").value,320);}\ndocument.getElementById("top").oninput=render;\ndocument.getElementById("bottom").oninput=render;\ndocument.getElementById("bigger").onclick=function(){fs=Math.min(64,fs+4);render();};\ndocument.getElementById("smaller").onclick=function(){fs=Math.max(18,fs-4);render();};\ndocument.getElementById("dl").onclick=function(){alert("скоро™");};\nrender();'
    },
    tease2: "О, теперь текст можно менять, размер крутится, обводка — как в настоящих мемах. 😎 Но есть одна мелочь: кнопка «Скачать PNG»… она как бы работает. Ну, в каком-то смысле. Проверишь? 😉",
    // ---------- ФИНАЛ ----------
    final: {
      html: '<div class="wrap">\n  <h1>🖼️ Мем-генератор</h1>\n  <div class="row">\n    <canvas id="cv" width="480" height="360"></canvas>\n    <div class="panel">\n      <input id="top" placeholder="Верхний текст" value="КОГДА СДАЧА В 23:59">\n      <input id="bottom" placeholder="Нижний текст" value="Я И ИИ">\n      <div class="row2"><button id="bigger">A+</button><button id="smaller">A−</button><button id="rand">🎲 Случайный</button></div>\n      <button id="dl" class="main">⬇ Скачать PNG</button>\n    </div>\n  </div>\n</div>',
      css: 'body{margin:0;background:#0b1026;color:#fff;font-family:Arial;display:flex;justify-content:center}\n.wrap{padding:20px}\nh1{color:#7df9ff;text-align:center;text-shadow:0 0 14px #7df9ff66}\n.row{display:flex;gap:16px;align-items:flex-start}\ncanvas{border:2px solid #7df9ff33;border-radius:12px}\n.panel{display:flex;flex-direction:column;gap:10px;width:240px}\ninput{padding:10px;border-radius:8px;border:1px solid #7df9ff44;background:#141a35;color:#fff;font-size:15px}\n.row2{display:flex;gap:8px}\nbutton{padding:8px 12px;border-radius:8px;border:none;cursor:pointer;background:#1c2450;color:#fff;font-size:14px}\nbutton:hover{background:#273269}\n.main{background:#7df9ff;color:#04222b;font-weight:700;font-size:16px;padding:12px}',
      js: 'var cv=document.getElementById("cv"),x=cv.getContext("2d");\nvar fs=34;\nvar PHRASES=[\n  ["КОГДА СДАЧА В 23:59","Я И НЕЙРОНКА"],\n  ["Я НАПИСАЛ КОД","ОН РАБОТАЕТ"],\n  ["МОЙ HTML","И ЕЩЁ МОЙ HTML"],\n  ["ЭТО НЕ БАГ","ЭТО ФИЧА"],\n  ["КОД РАБОТАЕТ","Я НЕ ЗНАЮ КАК"],\n  ["ПРЕПОД: СДЕЛАЙ САМ","Я: Я СДЕЛАЛ С AI"]\n];\nfunction scene(){\n  x.fillStyle="#0b1026";x.fillRect(0,0,480,360);\n  var i;\n  for(i=0;i<40;i++){x.fillStyle="rgba(255,255,255,"+(.3+Math.random()*.7)+")";x.fillRect(Math.random()*480,Math.random()*360,2,2);}\n  x.fillStyle="#3b2f63";x.beginPath();x.arc(400,80,40,0,7);x.fill();\n  x.strokeStyle="#5b4a9e";x.lineWidth=6;x.beginPath();x.arc(400,80,58,-.6,.9);x.stroke();\n  x.font="90px serif";x.textAlign="center";x.fillText("🐱",240,240);\n  x.font="40px serif";x.fillText("🚀",150,150);\n}\nfunction memeText(t,y){\n  if(!t)return;\n  x.font="900 "+fs+"px Arial";x.textAlign="center";\n  x.lineWidth=Math.max(3,fs/8);x.strokeStyle="#000";x.fillStyle="#fff";\n  x.strokeText(t.toUpperCase(),240,y);x.fillText(t.toUpperCase(),240,y);\n}\nfunction render(){scene();memeText(document.getElementById("top").value,70);memeText(document.getElementById("bottom").value,320);}\ndocument.getElementById("top").oninput=render;\ndocument.getElementById("bottom").oninput=render;\ndocument.getElementById("bigger").onclick=function(){fs=Math.min(64,fs+4);render();};\ndocument.getElementById("smaller").onclick=function(){fs=Math.max(18,fs-4);render();};\ndocument.getElementById("rand").onclick=function(){\n  var p=PHRASES[Math.random()*PHRASES.length|0];\n  document.getElementById("top").value=p[0];\n  document.getElementById("bottom").value=p[1];\n  render();\n};\ndocument.getElementById("dl").onclick=function(){\n  var a=document.createElement("a");\n  a.download="meme.png";\n  a.href=cv.toDataURL("image/png");\n  a.click();\n};\nrender();'
    },
    revealText: "Ха, я вижу, ты нажал «Скачать». 😄 Ладно, финальный аккорд. Вот подходящий промпт — отправь его мне (кнопка ниже), и получишь полноценный генератор со скачиванием и случайными фразами:",
    revealPrompt: "Сделай мем-генератор одним html-файлом: canvas 480×360 со сценой (звёзды, планета, кот и ракета эмодзи), поля ввода верхнего и нижнего текста, текст рисуется крупным жирным шрифтом белым с чёрной обводкой (strokeText), кнопки размера шрифта A+ и A−, кнопка «🎲 Случайный» выбирает пару смешных фраз из 6 заготовок, кнопка «⬇ Скачать PNG» через canvas.toDataURL и download. Тёмная космическая тема, без внешних библиотек.",
    finalText: "Вот твой полноценный мем-генератор! 🖼️ Введите фразы, крутите размер, жмите «🎲 Случайный» и скачивайте PNG. Жми «⚡ Вставить в редактор» → «▶ Запустить» → скачай один мем для себя → «📤 Отправить». Ты топ. 🐱",
    note1: "💡 Баги: текст зашит («LOL»/«ME»), обводки нет (почти не читается), управления нет.",
    note2: "💡 Управление появилось, но «Скачать PNG» — это alert('скоро™'). Пусть команда починит (или получит реверс).",
    note3: "💡 Твист: нейронка выдаёт готовый нормальный промпт.",
    note4: "💡 Рабочее приложение. Вставить → запустить → отправить."
  }
];

function taskById(id) { return TASKS.find(t => t.id === +id); }
