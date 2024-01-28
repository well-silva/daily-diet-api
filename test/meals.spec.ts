import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'child_process'
import { e } from 'vitest/dist/reporters-rzC174PQ'

describe('Meals routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'john.doe@gmail.com',
    })

    const cookies = createUserResponse.headers['set-cookie']

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Cafe da manha',
        description: 'pao com ovo',
        isOnDiet: true,
        date: '01/01/2024',
      })
      .expect(201)
  })

  it('should be able to update a meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'john.doe@gmail.com',
    })

    const cookies = createUserResponse.headers['set-cookie']

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Cafe da manha',
      description: 'pao com ovo',
      isOnDiet: true,
      date: '01/01/2024',
    })

    const getMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    const mealId = getMealsResponse.body.meals[0].id

    await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .send({
        name: 'Cafe da manha',
        description: 'pao com ovo',
        isOnDiet: true,
        date: '01/01/2024',
      })
      .expect(204)
  })

  it('should be able to delete a meal', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'john.doe@gmail.com',
    })

    const cookies = createUserResponse.headers['set-cookie']

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Cafe da manha',
      description: 'pao com ovo',
      isOnDiet: true,
      date: '01/01/2024',
    })

    const getMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    const mealId = getMealsResponse.body.meals[0].id

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(204)
  })

  it('should be able to list all meals', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'john.doe@gmail.com',
    })

    const cookies = createUserResponse.headers['set-cookie']

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Cafe da manha',
      description: 'pao com ovo',
      isOnDiet: true,
      date: '01/01/2024',
    })

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Lanche',
      description: 'barra de chocolate',
      isOnDiet: false,
      date: '01/01/2024',
    })

    await request(app.server).get('/meals').set('Cookie', cookies)

    const getMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    expect(getMealsResponse.body.meals).toHaveLength(2)
    expect(getMealsResponse.body.meals[0].name).toBe('Cafe da manha')
    expect(getMealsResponse.body.meals[1].name).toBe('Lanche')
  })

  it('should be able to list single meals', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'John Doe',
      email: 'john.doe@gmail.com',
    })

    const cookies = createUserResponse.headers['set-cookie']

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Cafe da manha',
        description: 'pao com ovo',
        isOnDiet: true,
        date: '01/01/2024',
      })
      .expect(201)

    const getMealResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    const mealId = getMealResponse.body.meals[0].id

    const getMealsResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(200)

    console.log(getMealsResponse.body.meal)

    expect(getMealsResponse.body).toEqual({
      meal: expect.objectContaining({
        id: expect.any(String),
        user_id: expect.any(String),
        name: 'Cafe da manha',
        description: 'pao com ovo',
        is_on_diet: 1,
        date: expect.any(Number),
        created_at: expect.any(String),
        updated_at: expect.any(String),
      }),
    })
  })
})
