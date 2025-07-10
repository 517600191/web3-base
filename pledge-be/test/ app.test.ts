import request from 'supertest';
import { app, server } from '../src/app';

// 修改 afterEach 函数，使用 async/await 确保服务器在所有异步操作完成后关闭
afterEach(async () => {
  await new Promise((resolve) => server.close(resolve));
});

describe('GET /swapEvent', () => {
  it('应返回 200 状态码和 Swap 事件数据', async () => {
    const response = await request(app).get('/swapEvent');
    // 打印关键属性
    console.log('响应状态码:', response.statusCode);
    console.log('响应体:', response.body);
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  //   it('在出错时应返回 500 状态码和错误信息', async () => {
  //     // 模拟错误，这里可以通过修改 app.ts 里的代码来模拟，例如传入错误的地址
  //     const response = await request(app).get('/swapEvent');
  //     expect(response.statusCode).toBe(500);
  //     expect(response.body).toHaveProperty('error');
  //   });
});