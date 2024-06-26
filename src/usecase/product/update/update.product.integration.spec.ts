import { Sequelize } from "sequelize-typescript";
import ProductModel from "../../../infrastructure/product/repository/sequelize/product.model";
import ProductRepository from "../../../infrastructure/product/repository/sequelize/product.repository";
import UpdateProductUseCase from "./update.product.usecase";
import Product from "../../../domain/product/entity/product";

describe("Integration Test update product use case", () => {
    let sequelize: Sequelize
    
    beforeEach(async () => {
        sequelize = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
            sync: { force: true },
        });
        sequelize.addModels([ProductModel]);
        await sequelize.sync();
    });

    afterEach(async () => {
        await sequelize.close();
    });

    it("should update a product", async () => {
        const productRepository = new ProductRepository();
        const usecase = new UpdateProductUseCase(productRepository);

        const product = new Product("123", "Product", 99);

        await productRepository.create(product);

        const input = {
            id: "123",
            name: "Product Updated",
            price: 999,
        };

        const expected = {
            id: "123",
            name: "Product Updated",
            price: 999,
        };

        const updateResult = await usecase.execute(input);
        expect(updateResult).toEqual(expected);

        const findResult = await productRepository.find("123");
        expect(findResult).toMatchObject(expected);
    });
});