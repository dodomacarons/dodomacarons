import mongoose from 'mongoose';
import morgan from 'morgan';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from 'express-jwt';
import { DateTime } from 'luxon';
import logger from './logger';
import { authMiddleware } from './auth.middleware';
import { Reason, Flavor, Waste } from './schemas';

process.on('uncaughtException', (error) => {
  logger.error('uncaught Exception:', error);
  logger.info('exiting');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('unhandled Rejection:', reason);
  logger.info('exiting');
  process.exit(1);
});

(async () => {
  const host = process.env.HOST ?? '0.0.0.0';
  const port = process.env.PORT ? +process.env.PORT : 4201;
  const mongoConnectionString = process.env.MONGO_DB_CONNECTION_STRING ?? '';

  const app = express();

  app.use(
    cors({
      origin: ['http://localhost:4200', 'https://dodomacarons.duckdns.org'],
    }),
  );

  app.use(express.json());

  app.use(
    morgan('combined', {
      stream: {
        write: (message: string) => logger.http(message.trim()),
      },
    }),
  );

  try {
    await mongoose.connect(mongoConnectionString);
    logger.info('MongoDB connected');
  } catch (error) {
    logger.error(`MongoDB connection error: ${error}`);
  }

  app.use(authMiddleware);

  app.get('/api/waste', async (req, res) => {
    try {
      const { displayDate, flavor } = req.query;
      const page = parseInt(req.query.page as string, 10) || 0;
      const pageSize = parseInt(req.query.pageSize as string, 10) || 100;
      const sortModel = req.query.sortModel
        ? JSON.parse((req.query.sortModel as string) || '[]')
        : [];
      const filter: {
        displayDate?: { $gte: Date; $lte: Date };
        flavor?: mongoose.Types.ObjectId;
      } = {};

      if (displayDate) {
        const start = DateTime.fromISO(displayDate as string)
          .startOf('day')
          .toJSDate();
        const end = DateTime.fromISO(displayDate as string)
          .endOf('day')
          .toJSDate();

        filter.displayDate = { $gte: start, $lte: end };
      }

      if (flavor && mongoose.Types.ObjectId.isValid(flavor as string)) {
        filter.flavor = new mongoose.Types.ObjectId(flavor as string);
      }

      const sort: Record<string, 1 | -1> = {};
      if (Array.isArray(sortModel) && sortModel.length > 0) {
        sortModel.forEach(({ field, sort: direction }) => {
          if (field === 'flavor.nameCopy') {
            sort['flavor.name'] = direction === 'asc' ? 1 : -1;
          } else {
            sort[field] = direction === 'asc' ? 1 : -1;
          }
        });
      }

      const total = await Waste.countDocuments(filter);
      const wastes = await Waste.aggregate([
        { $match: filter },

        {
          $lookup: {
            from: 'flavors',
            localField: 'flavor',
            foreignField: '_id',
            as: 'flavor',
          },
        },
        { $unwind: '$flavor' },

        { $sort: Object.keys(sort).length > 0 ? sort : { createdAt: -1 } },
        { $skip: page * pageSize },
        { $limit: pageSize },
      ]).collation({ locale: 'hu' });

      res.status(200).json({
        message: 'Wastes retrieved successfully',
        data: wastes,
        total,
      });
    } catch (error) {
      logger.error(`error fetching wastes: ${(error as Error).message}'`);
      res.status(500).json({ message: `Error fetching waste entries: ${(error as Error).message}`, error });
    }
  });

  app.get('/api/aggregate1', async (req, res) => {
    try {
      const { dateFrom, dateTo, dateFilterField } = req.query;

      if (!dateFilterField) {
        logger.error('aggregate 1 date filter field is missing.');
        res
          .status(500)
          .json({ message: 'aggregate 1 date filter field is missing.' });

        return;
      }

      const start = DateTime.fromISO(dateFrom as string)
        .startOf('day')
        .toJSDate();
      const end = DateTime.fromISO(dateTo as string)
        .endOf('day')
        .toJSDate();

      const page = parseInt(req.query.page as string, 10) || 0;
      const pageSize = parseInt(req.query.pageSize as string, 10) || 50;
      const sortModel = req.query.sortModel
        ? JSON.parse((req.query.sortModel as string) || '[]')
        : [];

      const sort: Record<string, 1 | -1> = {};
      if (Array.isArray(sortModel) && sortModel.length > 0) {
        sortModel.forEach(({ field, sort: direction }) => {
          if (field === 'flavor.nameCopy') {
            sort['flavor.name'] = direction === 'asc' ? 1 : -1;
          } else {
            sort[field] = direction === 'asc' ? 1 : -1;
          }
        });
      }

      const result = await Waste.aggregate([
        {
          $match: {
            [dateFilterField as string]: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: '$flavor',
            totalDisplayed: { $sum: '$displayedQuantity' },
            totalWaste: {
              $sum: {
                $add: ['$manufacturingWasteQuantity', '$shippingWasteQuantity'],
              },
            },
          },
        },
        {
          $addFields: {
            wasteRatio: {
              $cond: [
                {
                  $or: [
                    { $eq: ['$totalDisplayed', 0] },
                    { $eq: ['$totalDisplayed', null] },
                  ],
                },
                0,
                {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ['$totalWaste', '$totalDisplayed'] },
                        100,
                      ],
                    },
                    2,
                  ],
                },
              ],
            },
          },
        },
        {
          $lookup: {
            from: 'flavors',
            localField: '_id',
            foreignField: '_id',
            as: 'flavor',
          },
        },
        {
          $unwind: {
            path: '$flavor',
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $sort: Object.keys(sort).length > 0 ? sort : { wasteRatio: -1 },
        },
        {
          $facet: {
            items: [
              { $skip: page * pageSize },
              { $limit: pageSize },
              {
                $project: {
                  _id: 0,
                  flavor: '$flavor.name',
                  totalDisplayed: 1,
                  totalWaste: 1,
                  wasteRatio: 1,
                },
              },
            ],
            totalCount: [{ $count: 'total' }],
          },
        },
        {
          $project: {
            items: 1,
            total: { $ifNull: [{ $arrayElemAt: ['$totalCount.total', 0] }, 0] },
          },
        },
      ]).collation({ locale: 'hu' });

      res
        .status(200)
        .json({ message: 'Wastes retrieved successfully', data: result[0] });
    } catch (error) {
      logger.error(`error fetching wastes: ${(error as Error).message}`);
      res.status(500).json({ message: `Error fetching waste entries: ${(error as Error).message}`, error });
    }
  });

  app.get('/api/aggregate2', async (req, res) => {
    try {
      const { dateFrom, dateTo } = req.query;
      const start = DateTime.fromISO(dateFrom as string)
        .startOf('day')
        .toJSDate();
      const end = DateTime.fromISO(dateTo as string)
        .endOf('day')
        .toJSDate();

      const page = parseInt(req.query.page as string, 10) || 0;
      const pageSize = parseInt(req.query.pageSize as string, 10) || 50;
      const sortModel = req.query.sortModel
        ? JSON.parse((req.query.sortModel as string) || '[]')
        : [];

      const sort: Record<string, 1 | -1> = {};
      if (Array.isArray(sortModel) && sortModel.length > 0) {
        sortModel.forEach(({ field, sort: direction }) => {
          if (field === 'manufacturingDate') {
            sort['_id'] = direction === 'asc' ? 1 : -1;
          } else {
            sort[field] = direction === 'asc' ? 1 : -1;
          }
        });
      }

      const result = await Waste.aggregate([
        {
          $match: {
            manufacturingDate: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: '$manufacturingDate',
            totalWaste: {
              $sum: {
                $add: ['$manufacturingWasteQuantity', '$shippingWasteQuantity'],
              },
            },
          },
        },
        {
          $sort:
            Object.keys(sort).length > 0 ? sort : { manufacturingDate: -1 },
        },
        {
          $facet: {
            items: [
              { $skip: page * pageSize },
              { $limit: pageSize },
              {
                $project: {
                  manufacturingDate: '$_id',
                  _id: 0,
                  totalWaste: 1,
                },
              },
            ],
            totalCount: [{ $count: 'total' }],
          },
        },
        {
          $project: {
            items: 1,
            total: { $ifNull: [{ $arrayElemAt: ['$totalCount.total', 0] }, 0] },
          },
        },
      ]).collation({ locale: 'hu' });
      res
        .status(200)
        .json({ message: 'Wastes retrieved successfully', data: result[0] });
    } catch (error) {
      logger.error(`error fetching wastes: ${(error as Error).message}`);
      res.status(500).json({ message: `Error fetching waste entries: ${(error as Error).message}`, error });
    }
  });

  app.post('/api/waste', async (req, res) => {
    logger.info('attempting to create a new waste record');
    try {
      const {
        manufacturingDate,
        releaseDate,
        displayDate,
        flavor,
        displayedQuantity,
        manufacturingWasteQuantity,
        manufacturingWasteReason,
        shippingWasteQuantity,
        comment,
      } = req.body;

      const newWaste = new Waste({
        manufacturingDate,
        releaseDate,
        displayDate,
        flavor,
        displayedQuantity,
        manufacturingWasteQuantity,
        manufacturingWasteReason,
        shippingWasteQuantity,
        comment,
      });

      await newWaste.save();

      logger.info(`waste record created successfully with id: ${newWaste._id}`);

      res
        .status(201)
        .json({ message: 'Waste entry created successfully', data: newWaste });
    } catch (error) {
      logger.error(
        `failed to to create a new waste record: ${(error as Error).message}`,
      );

      res.status(500).json({
        message: 'Error creating waste entry',
        error,
      });
    }
  });

  app.patch('/api/waste/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    logger.info(`attempting to update waste record with id: ${id}`);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      logger.error(`invalid mongo id: ${id}`);
      res.status(400).json({ error: 'Invalid ID' });
      return;
    }

    logger.info(`mongo id, ${id} is valid, proceeding`);

    try {
      const updatedWaste = await Waste.findByIdAndUpdate(
        new mongoose.Types.ObjectId(id),
        {
          ...updates,
          updatedAt: new Date(),
        },
        { new: true, runValidators: true },
      );

      if (!updatedWaste) {
        logger.error(`waste record not found in db, id: ${id}`);
        res.status(404).json({ error: 'Waste not found' });
        return;
      }

      logger.info(`waste record updated successfully, id: ${id}`);

      res.json({
        message: 'Waste entry updated successfully',
        data: updatedWaste,
      });
    } catch (error) {
      logger.error(`error updating waste record: ${(error as Error).message}`);
      res.status(500).json({
        message: 'Error updating waste entry',
        error,
      });
    }
  });

  app.delete('/api/waste/:id', async (req, res) => {
    const { id } = req.params;
    logger.info(`attempting to delete a waste record with id ${id}`);
    try {
      const result = await Waste.findByIdAndDelete(id);
      if (!result) {
        logger.error(`waste record not found in db, id: ${id}`);
        res.status(404).json({ message: 'Entry not found' });
        return;
      }
      logger.info(`waste record deleted successfully, id: ${id}`);
      res.json({ message: 'Entry deleted successfully' });
    } catch (error) {
      logger.error(`error deleting waste record: ${(error as Error).message}`);
      res.status(500).json({
        message: 'Error deleting waste entry',
        error,
      });
    }
  });

  app.get('/api/reason', async (req, res) => {
    try {
      const reasons = await Reason.find()
        .sort({ name: 1 })
        .collation({ locale: 'hu' });

      res.status(200).json({
        message: 'Reasons retrieved successfully',
        data: reasons,
      });
    } catch (error) {
      logger.error(`error retrieving reasons: ${(error as Error).message}`);
      res.status(500).json({
        message: `Error retrieving reasons: ${(error as Error).message}`,
        error,
      });
    }
  });

  app.post('/api/reason', async (req, res) => {
    logger.info('attempting to create a new reason record');
    try {
      const { name } = req.body;

      const newReason = new Reason({
        name,
      });

      await newReason.save();

      logger.info(`reason record created successfully: ${newReason.name}`);

      res.status(201).json({
        message: 'Reason entry created successfully',
        data: newReason,
      });
    } catch (error) {
      logger.error(
        `failed to to create a new reason record: ${(error as Error).message}`,
      );

      res.status(500).json({
        message: 'Error creating reason entry',
        error,
      });
    }
  });

  app.get('/api/flavor', async (req, res) => {
    try {
      const flavors = await Flavor.find()
        .sort({ name: 1 })
        .collation({ locale: 'hu' });

      res.status(200).json({
        message: 'Flavors retrieved successfully',
        data: flavors,
      });
    } catch (error) {
      logger.error(`error retrieving flavors: ${(error as Error).message}`);
      res.status(500).json({
        message: `Error retrieving flavors: ${(error as Error).message}`,
        error,
      });
    }
  });

  app.post('/api/flavor', async (req, res) => {
    logger.info('attempting to create a new flavor record');
    try {
      const { name } = req.body;

      const newFlavor = new Flavor({
        name,
      });

      await newFlavor.save();

      logger.info(`flavor record created successfully: ${newFlavor.name}`);

      res.status(201).json({
        message: 'Flavor entry created successfully',
        data: newFlavor,
      });
    } catch (error) {
      logger.error(
        `failed to to create a new flavor record: ${(error as Error).message}`,
      );

      res.status(500).json({
        message: 'Error creating flavor entry',
        error,
      });
    }
  });

  app.use(function (
    err: unknown,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction, // <-- needed for express to detect this function as an error handler
  ) {
    if ((err as UnauthorizedError).name === 'UnauthorizedError') {
      logger.error('invalid auth token');
      res.status(401).json({ message: 'Invalid auth token' });
      return;
    }
    logger.error(`unhandled error thrown: ${err}`);
    res.status(500).json({ message: 'Something went wrong' });
  });

  app.listen(port, host, () => {
    logger.info(`app is running on http://${host}:${port}`);
  });
})();
