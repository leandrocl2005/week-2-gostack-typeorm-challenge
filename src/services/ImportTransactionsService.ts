import Transaction from '../models/Transaction';
import { getRepository, In, getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';
import fs from 'fs';
import csvParser from 'csv-parse';

interface CsvTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filepath: string): Promise<Transaction[]> {
    // TODO
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const contactsReadStream = fs.createReadStream(filepath);

    const parsers = csvParser({
      delimiter: ',',
      from_line: 2,
    });

    const parseCsv = contactsReadStream.pipe(parsers);

    const transactions: CsvTransaction[] = [];
    const categories: string[] = [];

    parseCsv.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) return;

      categories.push(category);
      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => parseCsv.on('end', resolve));

    const existentCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });

    const existentCategoriesTitle = existentCategories.map(
      (category: Category) => category.title,
    );

    const addCategoryTitles = categories
      .filter(category => !existentCategoriesTitle.includes(category))
      .filter((v, i, a) => a.indexOf(v) === i);

    const newCategoriesToSave = categoriesRepository.create(
      addCategoryTitles.map(title => ({
        title,
      })),
    );

    const newCategories = await categoriesRepository.save(newCategoriesToSave);

    const allCategories = [...newCategories, ...existentCategories];

    const allCategoriesIds = transactions.map(
      transaction =>
        allCategories.find(item => item.title === transaction.category)?.id,
    );

    const transactionsTosave = transactionsRepository.create(
      transactions.map((transaction, index) => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category_id: allCategoriesIds[index],
      })),
    );

    const savedtransactions = await transactionsRepository.save(
      transactionsTosave,
    );

    return savedtransactions;
  }
}

export default ImportTransactionsService;
