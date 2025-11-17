// ~/utils/modalUtils.ts
import type { RefObject } from "react";

/**
 * Opens a modal and optionally sets up form data
 */
export const handleModalOpen = <T>(
  modalRef: RefObject<any>,
  formRef?: RefObject<any>,
  row?: T | null,
  setEditRow?: (row: T | null) => void,
  setErrorMessage?: (msg: string | string[] | null) => void
) => {
  setErrorMessage?.(null);

  if (row) {
    setEditRow?.(row);
    formRef?.current?.setFormData?.(row);
  } else {
    setEditRow?.(null);
    formRef?.current?.resetForm?.();
  }

  modalRef?.current?.openModal?.();
};

/**
 * Opens a modal directly
 */
export const openModal = (modalRef: RefObject<any>) => {
  modalRef?.current?.openModal?.();
};

/**
 * Closes a modal directly
 */
export const closeModal = (modalRef: RefObject<any>) => {
  modalRef?.current?.closeModal?.();
};

/**
 * Closes and optionally resets the form
 */
export const handleModalClose = (
  modalRef: RefObject<any>,
  formRef?: RefObject<any>,
  resetForm: boolean = false
) => {
  if (resetForm) formRef?.current?.resetForm?.();
  modalRef?.current?.closeModal?.();
};
