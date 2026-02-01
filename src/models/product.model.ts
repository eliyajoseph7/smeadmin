import type { BaseEntity } from './common.model';

// Unit of Measure Model
export interface UnitOfMeasure extends BaseEntity {
  name: string;
  code: string;
  description: string;
  isActive: boolean;
}

export interface CreateUnitOfMeasureRequest {
  name: string;
  code: string;
  description: string;
}

export interface UpdateUnitOfMeasureRequest extends Partial<CreateUnitOfMeasureRequest> {
  isActive?: boolean;
}

// Category Model
export interface Category extends BaseEntity {
  categoryCode: string;
  categoryName: string;
  categoryDescription: string;
  parentCategoryId: string | null;
  displayOrder: number;
  categoryIcon: string;
  categoryColor: string;
  isDefaultCategory: boolean;
  isActive: boolean;
}

export interface CreateCategoryRequest {
  categoryCode: string;
  categoryName: string;
  categoryDescription: string;
  parentCategoryId?: string | null;
  displayOrder: number;
  categoryIcon: string;
  categoryColor: string;
  isDefaultCategory: boolean;
  isActive: boolean;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  id: string;
}
