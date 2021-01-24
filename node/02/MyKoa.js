const context = {
  get url() {
    return this.req.url;
  },

  get body() {
    return this.res.body;
  },
  set body(value) {
    this.res.body = value;
  },
  get method() {
    return this.req.method;
  },
};

class HzlKoa {
  constructor() {
    this.middleware = [];
  }

  use(fn) {
    this.middleware.push(fn);
  }

  listen(port, callback) {
    const http = require('http');
    const server = http.createServer(async (req, res) => {
      const ctx = this.createContext(req, res);
      const fn = this.compose(this.middleware);
      await fn(ctx);
      res.end(ctx.res.body);
    });

    server.listen(port, callback);
  }

  compose(middleware) {
    return function (context) {
      const dispatch = (i) => {
        const fn = middleware[i];
        if (typeof fn !== 'function') {
          return Promise.resolve();
        }
        return Promise.resolve(fn(context, () => dispatch(++i)));
      };
      //
      return dispatch(0);
    };
  }

  createContext(req, res) {
    const ctx = Object.create(context);
    ctx.req = req;
    ctx.res = res;
    return ctx;
  }
}

const app = new HzlKoa();

app.listen(3000, () => {
  console.log('监听端口已启动 http://localhost:3000');
});

app.use(async (ctx, next) => {
  console.log(ctx.req.url);
  console.log(ctx.req.method);
  ctx.body = 'haha';
  await next();
});
const delay = () => new Promise((resolve) => setTimeout(() => resolve(), 2000));

app.use(async (ctx, next) => {
  console.log('>>>2');
  ctx.body += '1';
  await next();
  console.log('<<<2');
  ctx.body += '5';
});

app.use(async (ctx, next) => {
  console.log('3');
  ctx.body += '2';
  await delay();
  await next();

  console.log('3 hui');
  ctx.body += '4';
});

app.use(async (ctx, next) => {
  console.log('4');
  ctx.body += '3';
});
