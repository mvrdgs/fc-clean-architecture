import express from "express";
import CreateProductUseCase from "../../../usecase/product/create/create.product.usecase";
import ProductRepository from "../../product/repository/sequelize/product.repository";
import FindProductUseCase from "../../../usecase/product/find/find.product.usecase";
import ListProductUseCase from "../../../usecase/product/list/list.product.usecase";
import UpdateProductUseCase from "../../../usecase/product/update/update.product.usecase";
import ProductPresenter from "../presenters/product.presenter";

export const productRoute = express.Router();

productRoute.post("/", async (req, res) => {
    const usecase = new CreateProductUseCase(new ProductRepository());
    try {
        const productDto = {
            type: req.body.type || 'a',
            name: req.body.name,
            price: req.body.price,
        };
        const output = await usecase.execute(productDto);
        return res.send(output);
    } catch (err) {
        return res.status(500).send(err);
    }
});

productRoute.get("/:id", async (req, res) => {
    const usecase = new FindProductUseCase(new ProductRepository());
    try {
        const output = await usecase.execute({ id: req.params.id });
        res.send(output);
    } catch (err) {
        if((err as Error).message === 'Product not found') {
            return res.status(404).send(err);
        }
        return res.status(500).send(err);
    }
});

productRoute.get("/", async (req, res) => {
    const usecase = new ListProductUseCase(new ProductRepository());
    try {
        const output = await usecase.execute({});
        return res.format({
            json: async () => res.send(output),
            xml: async () => res.send(ProductPresenter.listXML(output)),
        }).send();
    } catch (err) {
        return res.status(500).send(err);
    }
});

productRoute.put("/:id", async (req, res) => {
    const usecase = new UpdateProductUseCase(new ProductRepository());
    try {
        const productDto = {
            id: req.params.id,
            name: req.body.name,
            price: req.body.price,
        };
        const output = await usecase.execute(productDto);
        return res.send(output);
    } catch (err) {
        if((err as Error).message === 'Product not found') {
            return res.status(404).send(err);
        }
        return res.status(500).send(err);
    }
});
