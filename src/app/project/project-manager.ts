import {
  createProjectDocument,
  type CurristProjectData,
  type CurristProjectDocument,
} from "./project-document";

import { saveProjectToLocalStorage } from "./project-storage";

export class ProjectManager {
  static createProject(
    projectData: CurristProjectData,
    existingMetadata?: Pick<
      CurristProjectDocument,
      "documentId" | "createdAt"
    >
  ): CurristProjectDocument {
    return createProjectDocument(
      projectData,
      existingMetadata
    );
  }

  static saveProject(
    project: CurristProjectDocument
  ) {
    saveProjectToLocalStorage(project);
  }

  static buildProjectDocument(
    projectData: CurristProjectData,
    documentId: string | null,
    createdAt: number | null
  ): CurristProjectDocument {
    return createProjectDocument(
      projectData,
      documentId && createdAt
        ? {
            documentId,
            createdAt,
          }
        : undefined
    );
  }
}
