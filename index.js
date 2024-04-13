const fs = require("fs").promises;

class Product {
    constructor(id, titulo, description, price, imagen, stock) {
        this.id = id;
        this.titulo = titulo;
        this.description = description;
        this.price = price;
        this.imagen = imagen;
        this.stock = stock;
    }
}

class ProductManager {
    constructor() {
        this.products = [];
    }

    async initialize() {
        try {
            const data = await fs.readFile("./data/products.json", "utf-8");
            this.products = JSON.parse(data);
        } catch (error) {
            console.log("No se pudo cargar el archivo de productos:", error);
        }
    }

    async saveProducts() {
      try {
          await fs.writeFile("./data/products.json", JSON.stringify(this.products, null, 2));
          console.log("Productos guardados correctamente.");
      } catch (error) {
          console.log("Error al guardar productos:", error);
      }
  }
  

    getProducts() {
        return this.products;
    }

    addProduct(id, titulo, description, price, imagen, stock) {
        const newProduct = new Product(id, titulo, description, price, imagen, stock);
        this.products.push(newProduct);
        return newProduct;
    }

    getProductById(productId) {
        const product = this.products.find(product => product.id === productId);
        if (!product) {
            throw new Error(`El producto con id ${productId} no fue encontrado.`);
        }
        return product;
    }

    async updateProduct(productId, updatedFields) {
        const productIndex = this.products.findIndex(product => product.id === productId);
        if (productIndex === -1) {
            throw new Error(`El producto con id ${productId} no fue encontrado.`);
        }
        Object.assign(this.products[productIndex], updatedFields);
        await this.saveProducts();
        return this.products[productIndex];
    }

    async deleteProduct(productId) {
      try {
          const initialLength = this.products.length;
          this.products = this.products.filter(product => product.id !== productId);
          if (initialLength === this.products.length) {
              throw new Error(`El producto con id ${productId} no fue encontrado.`);
          }
          await this.saveProducts(); // Guardar la lista de productos actualizada en el archivo
      } catch (error) {
          console.log("Error al eliminar producto:", error.message);
      }
  }
  
}

async function main() {
    const manager = new ProductManager();
    await manager.initialize();

    // Llamar a getProducts debe devolver un arreglo vacío [] si no hay productos cargados
    console.log("Productos antes de agregar: ", manager.getProducts());

    // Agregar productos
    const product1 = manager.addProduct(123, "Producto prueba 1", "Este es un producto prueba 1", 200, "Sin imagen", 25);
    const product2 = manager.addProduct(456, "Producto prueba 2", "Este es un producto prueba 2", 200, "Sin imagen", 25);
    const product3 = manager.addProduct(789, "Producto prueba 3", "Este es un producto prueba 3", 200, "Sin imagen", 25);

    // Llamar a getProducts nuevamente, debe aparecer el producto recién agregado
    console.log("Productos después de agregar los productos: ", manager.getProducts());

    // Probar getProductById
    try {
        const product = manager.getProductById(product1.id);
        console.log("Producto encontrado por id: ", product);
    } catch (error) {
        console.log("Error al buscar producto por id: ", error.message);
    }

    // Probar updateProduct
    try {
        const updatedProduct = await manager.updateProduct(product3.id, { price: 250 });
        console.log("Producto actualizado:", updatedProduct);
    } catch (error) {
        console.log("Error al actualizar producto: ", error.message);
    }

    // Probar deleteProduct
    try {
        await manager.deleteProduct(product2.id);
        console.log("Producto eliminado correctamente.");
    } catch (error) {
        console.log("Error al eliminar producto: ", error.message);
    }

    console.log("Productos después de eliminar el producto: ", manager.getProducts());
}

main();
