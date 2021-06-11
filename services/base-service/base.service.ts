import {MongoError} from 'mongodb';
import {
  CreateQuery,
  Document,
  FilterQuery,
  Model,
  Query,
  Types,
  UpdateQuery
} from 'mongoose';
import {HttpException, HttpStatus} from '@nestjs/common';
import {AppError} from "../../common/constants/app-error.constants";
import {BaseModel, ExtendedMongoModel, MongoModel, ServerError} from "../../index"
import {PaginationInput} from "./pagination.input";
import {PaginatedModel} from "./pagination.type";

export abstract class BaseService<T extends BaseModel | MongoModel | ExtendedMongoModel> {
  protected constructor(
    public model: Model<T & Document>,
  ) {
  }

  protected static throwMongoError(err: MongoError): void {
    throw new ServerError(err, err.errmsg);
  }

  public async delete(_id: string, user_id: string): Promise<boolean> {
    // @ts-ignore
    return this.model.softDelete(_id, user_id);
  }

  protected static toObjectId(id: string): Types.ObjectId {
    try {
      return Types.ObjectId(id);
    } catch (e) {
      this.throwMongoError(e);
    }
  }

  public async _findOne(filter = {}): Promise<T> {
    try {
      return this.model.findOne(filter);
    } catch (e) {
      BaseService.throwMongoError(e);
    }
  }

  public async findOne(filter = {}): Promise<T> {
    const result = await this._findOne(filter);
    if (!result) {
      throw new HttpException(
        AppError.MODEL_NOT_FOUND(this.model.modelName),
        HttpStatus.NOT_FOUND
      );
    }
    return result;
  }

  public async _findById(id: string): Promise<T> {
    try {
      return this.model.findById(BaseService.toObjectId(id));
    } catch (e) {
      BaseService.throwMongoError(e);
    }
  }

  public async findById(id: string): Promise<T> {
    const result = await this._findById(id);
    if (!result) {
      throw new HttpException(
        AppError.MODEL_NOT_FOUND(this.model.modelName),
        HttpStatus.NOT_FOUND
      );
    }
    return result;
  }

  public async _findOneAndUpdate(
    query: FilterQuery<T & Document>,
    item: UpdateQuery<T & Document>
  ): Promise<T> {
    try {
      return this.model.findOneAndUpdate(
        query,
        item as UpdateQuery<T & Document>,
        {
          new: true,
          useFindAndModify: false
        }
      );
    } catch (e) {
      BaseService.throwMongoError(e);
    }
  }

  public async findOneAndUpdate(
    query: FilterQuery<T & Document>,
    item: UpdateQuery<T & Document>
  ): Promise<T> {
    const result = await this._findOneAndUpdate(query, item);
    if (!result) {
      throw new HttpException(
        AppError.MODEL_NOT_FOUND(this.model.modelName),
        HttpStatus.NOT_FOUND
      );
    }
    return result;
  }

  public async _create(item: CreateQuery<T>): Promise<T> {
    try {
      return this.model.create(item);
    } catch (e) {
      BaseService.throwMongoError(e);
    }
  }

  public async create(item: CreateQuery<T>): Promise<T> {
    const result = await this._create(item);
    if (!result) {
      throw new HttpException(
        AppError.FAILED_TO_CREATE(this.model.modelName),
        HttpStatus.BAD_REQUEST
      );
    }
    return result;
  }

  public async _deleteById(id: string): Promise<T> {
    try {
      return this.model.findByIdAndDelete(id);
    } catch (e) {
      BaseService.throwMongoError(e);
    }
  }

  public async deleteById(id: string): Promise<T> {
    const result = await this._deleteById(id);
    if (!result) {
      throw new HttpException(
        AppError.MODEL_NOT_FOUND(this.model.modelName),
        HttpStatus.NOT_FOUND
      );
    }
    return result;
  }

  public async _update(item: T): Promise<T> {
    try {
      return this.model.findByIdAndUpdate(
        BaseService.toObjectId(item._id),
        item as any,
        {
          new: true,
          useFindAndModify: false
        }
      );
    } catch (e) {
      BaseService.throwMongoError(e);
    }
  }

  public async update(item: Partial<T>): Promise<T> {
    const result = await this._update(item as any);
    if (!result) {
      throw new HttpException(
        AppError.MODEL_NOT_FOUND(this.model.modelName),
        HttpStatus.NOT_FOUND
      );
    }
    return result;
  }

  private _count(filter = {}): Query<number> {
    try {
      return this.model.count(filter);
    } catch (e) {
      BaseService.throwMongoError(e);
    }
  }

  public async count(filter = {}): Promise<number> {
    return this._count(filter);
  }

  public async _find(item = {}): Promise<Array<T>> {
    try {
      return this.model.find(item);
    } catch (e) {
      BaseService.throwMongoError(e);
    }
  }

  public async find(item?: FilterQuery<T>): Promise<Array<T>> {
    const result = await this._find(item);
    if (!result || !result.length) {
      throw new HttpException(
        AppError.MODEL_NOT_FOUND(this.model.modelName),
        HttpStatus.NOT_FOUND
      );
    }
    return result;
  }


  private filterQuery(filter: FilterQuery<T>): FilterQuery<T> {
    const filterObj = {};

    for (const key in filter) {
      typeof filter[key] === 'string'
        ? (filterObj[key] = { $regex: `.*${filter[key]}.*`, $options: '/i' })
        : typeof filter[key] === 'object'
        ? Array.isArray(filter[key])
          ? (filterObj[key] = {
            $in: filter[key]
          })
          : (filterObj[key] = filter[key])
        : (filterObj[key] = filter[key]);
    }

    return filterObj;
  }

  public async getDocuments(
    filter?: FilterQuery<T>,
    pagination?: PaginationInput
  ): Promise<PaginatedModel<T>> {
    const filterObj = filter ? this.filterQuery(filter) : {};
    //@ts-ignore
    const total = await this.model.count(filterObj);
    if (!pagination?.take) {
      //@ts-ignore
      const docs = await this.model.find(filterObj).sort({created_at: -1});
      return {
        docs,
        total,
        pageInfo: {
          hasNextPage: false,
          after: docs.length ? docs[docs.length - 1]['_id'] : null
        }
      };
    }

    const {take, after} = pagination;

    const query = after ? {...filterObj, _id: {$lt: after}} : filterObj;

    //@ts-ignore
    const docs = await this.model
      .find(query)
      .sort({created_at: -1})
      .limit(take + 1);

    if (!docs.length && after) {
      throw new HttpException(
        AppError.CANNOT_RETURN_ZERO_DOCUMENTS,
        HttpStatus.BAD_REQUEST
      );
    }

    const pageInfo = {
      hasNextPage: docs.length > take,
      after: !docs.length
        ? null
        : docs.length > take
          ? docs[docs.length - 2]['_id']
          : docs[docs.length - 1]['_id']
    };

    if (docs.length > take) docs.pop();

    return {docs, total, pageInfo};
  }
}
