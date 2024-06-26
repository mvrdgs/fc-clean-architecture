import Product from "../../../domain/product/entity/product";
import CreateProductUseCase from "./create.product.usecase";

const input = {
    type: "a",
    name: "Product",
    price: 123,
};

const product = new Product("123", "Product", 99);

const MockRepository = () => {
    return {
        find: jest.fn(),
        findAll: jest.fn(),
        create: jest.fn().mockReturnValue(Promise.resolve(product)),
        update: jest.fn(),
    };
};

describe("Unit Test create product use case", () => {
    it("should create a product", async () => {
        const productRepository = MockRepository();
        const productCreateUseCase = new CreateProductUseCase(productRepository);

        const output = await productCreateUseCase.execute(input);

        expect(output).toMatchObject({
            id: expect.any(String),
            name: input.name,
            price: input.price,
        });
    });

    it("should throw an error when name is missing", async () => {
        const productRepository = MockRepository();
        const productCreateUseCase = new CreateProductUseCase(productRepository);

        input.name = "";

        expect(async () => {
            return await productCreateUseCase.execute(input);
        }).rejects.toThrow("Name is required")
    });
});
