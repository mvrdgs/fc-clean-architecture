import { Sequelize } from "sequelize-typescript";
import ProductModel from "../../../infrastructure/product/repository/sequelize/product.model";
import ProductRepository from "../../../infrastructure/product/repository/sequelize/product.repository";
import CreateProductUseCase from "./create.product.usecase";

describe("Intregration Test create product use case", () => {
    let sequelize: Sequelize;

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

    afterEach( async () => {
        await sequelize.close();
    });

    it("should create a product", () => {
        const productRepository = new ProductRepository();
        const usecase = new CreateProductUseCase(productRepository);

        const input = {
            type: "a",
            name: "Product",
            price: 123,
        };

        const output = usecase.execute(input);

        expect(output).resolves.toMatchObject({
            id: expect.any(String),
            name: input.name,
            price: input.price,
        });
    });

    it("should fail to create a product if name is empty", async () => {
        const productRepository = new ProductRepository();
        const usecase = new CreateProductUseCase(productRepository);

        const input = {
            type: "a",
            name: "",
            price: 123,
        };

        await expect(usecase.execute(input)).rejects.toThrow("Name is required");
    });

    it("should fail to create a product if price is lower than 0", async () => {
        const productRepository = new ProductRepository();
        const usecase = new CreateProductUseCase(productRepository);

        const input = {
            type: "a",
            name: "Product",
            price: -123,
        };

        await expect(usecase.execute(input)).rejects.toThrow("Price must be greater than zero");
    });
});