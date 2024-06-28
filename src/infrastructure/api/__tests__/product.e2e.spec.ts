import { app, sequelize } from "../express";
import request from "supertest";

describe("E2E test for product", () => {
    beforeEach(async () => {
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it("should create a product", async () => {
        const response = await request(app)
            .post("/product")
            .send({
                type: 'a',
                name: 'Product A',
                price: 123,
            });

        expect(response.status).toBe(200);
        expect(typeof response.body.id).toEqual('string');
        expect(response.body.name).toBe('Product A');
        expect(response.body.price).toBe(123);
    });

    it("should not create a product", async () => {
        const response = await request(app)
            .post("/product")
            .send({
                price: 123,
            });
        
        expect(response.status).toBe(500);
    });


    it("should find a product", async () => {
        const createResponse = await request(app)
            .post("/product")
            .send({
                type: 'a',
                name: 'Product A',
                price: 123,
            });
        expect(createResponse.status).toBe(200);

        const response = await request(app)
            .get(`/product/${createResponse.body.id}`);
        
        expect(response.status).toBe(200);
        expect(response.body.name).toBe('Product A');
        expect(response.body.price).toBe(123);
    });

    it("should fail to find a product", async () => {
        const response = await request(app).get(`/product/123`);        
        expect(response.status).toBe(404);
    });

    it("should list all products", async () => {
        const createResponseA = await request(app)
            .post("/product")
            .send({
                type: 'a',
                name: 'Product A',
                price: 123,
            });
        expect(createResponseA.status).toBe(200);

        const createResponseB = await request(app)
            .post("/product")
            .send({
                type: 'b',
                name: 'Product B',
                price: 321,
            });
        expect(createResponseB.status).toBe(200);

        const listResponseJSON = await request(app).get("/product").send();
        expect(listResponseJSON.status).toBe(200);
        const { products } = listResponseJSON.body;
        expect(products.length).toBe(2);
        expect(products[0].name).toBe('Product A');
        expect(products[0].price).toBe(123);
        expect(products[1].name).toBe('Product B');
        expect(products[1].price).toBe(642);

        const listResponseXLM = await request(app).get("/product").set("Accept", "application/xml").send();
        expect(listResponseXLM.status).toBe(200);
        expect(listResponseXLM.text).toContain(`<?xml version="1.0" encoding="UTF-8"?>`)
        expect(listResponseXLM.text).toContain(`<products>`);
        expect(listResponseXLM.text).toContain(`<product>`);
        expect(listResponseXLM.text).toContain(`<name>Product A</name>`);
        expect(listResponseXLM.text).toContain(`<price>123</price>`);
        expect(listResponseXLM.text).toContain(`</product>`);
        expect(listResponseXLM.text).toContain(`<name>Product B</name>`);
        expect(listResponseXLM.text).toContain(`<price>642</price>`);
        expect(listResponseXLM.text).toContain(`</product>`);
        expect(listResponseXLM.text).toContain(`</products>`);
    });

    it("should update a product", async () => {
        const createResponse = await request(app)
            .post("/product")
            .send({
                type: 'a',
                name: 'Product A',
                price: 123,
            });
        expect(createResponse.status).toBe(200);

        const productID = createResponse.body.id;

        const findProduct = await request(app).get(`/product/${productID}`);
        expect(findProduct.body.name).toBe('Product A');
        expect(findProduct.body.price).toBe(123);

        const updateResponse = await request(app)
            .put(`/product/${createResponse.body.id}`)
            .send({
                name: 'Product A Updated',
                price: 321,
            });
        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.name).toBe('Product A Updated');
        expect(updateResponse.body.price).toBe(321);

        const findUpdatedProduct = await request(app).get(`/product/${productID}`);
        expect(findUpdatedProduct.body.name).toBe('Product A Updated');
        expect(findUpdatedProduct.body.price).toBe(321);
    });

    it("should fail to update a product", async () => {
        const response = await request(app)
            .put(`/product/123`)
            .send({
                name: 'Product A Updated',
                price: 321,
            });
        expect(response.status).toBe(404);
    });
});