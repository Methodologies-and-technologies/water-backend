import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorTypeEnum } from 'src/common/enums';
import { In, Repository } from 'typeorm';
import { PaginationChangeEventsDto } from './dto/pagination-change-events.dto';
import { QueryParamsDto } from './dto/query-params.dto';
import { ChangeEventEntity } from './change-event.entity';
import { EntityTypeEnum } from '../../common/enums/entity-type.enum';
import { EntityOperationEnum } from '../../common/enums/entity-operation.enum';
import { createError } from '../../common/helpers/error-handling.helpers';
import { SUCCESS } from '../auth/auth.constants';
import { ResponseSuccess } from '../auth/auth.interface';

@Injectable()
export class ChangeEventService {
  constructor(
    @InjectRepository(ChangeEventEntity)
    private readonly changeEventRepository: Repository<ChangeEventEntity>,
  ) {}

  public async createChangeEvent(
    type: EntityTypeEnum,
    operation: EntityOperationEnum,
    data: string,
    isProcessed: boolean,
  ): Promise<void> {
    const event: ChangeEventEntity = this.changeEventRepository.create({
      type,
      operation,
      data,
      isProcessed,
    });
    await this.changeEventRepository.save(event);
  }

  public async complete(ids: number[]): Promise<ResponseSuccess> {
    const foundEvents: ChangeEventEntity[] = await this.changeEventRepository.find({
      where: { id: In(ids) },
      select: ['id'],
    });
    if (foundEvents.length !== ids.length) {
      const invalidIds: number[] = ids.filter((id) => !foundEvents.find((e) => e.id === id));
      if (invalidIds.length > 0) {
        throw new BadRequestException(`Events for ids [${invalidIds.join(',')}] are not found`);
      }
    }
    await this.changeEventRepository.update({ id: In(ids) }, { isProcessed: true });
    return {
      result: SUCCESS,
    };
  }

  public async getChangeEvent(id: number): Promise<ChangeEventEntity> {
    const event: ChangeEventEntity = await this.changeEventRepository.findOne({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException(createError(ErrorTypeEnum.CHANGE_EVENT_NOT_FOUND, 'id'));
    }
    return event;
  }

  public async getManyChangeEvents(options: QueryParamsDto): Promise<PaginationChangeEventsDto> {
    const data: [ChangeEventEntity[], number] = await this.changeEventRepository.findAndCount({
      take: 10,
      skip: 0,
      where: {
        isProcessed: options.isProcessed !== undefined ? options.isProcessed : false,
      },
      order: {
        createdAt: 'ASC',
      },
    });
    return new PaginationChangeEventsDto(data);
  }
}
