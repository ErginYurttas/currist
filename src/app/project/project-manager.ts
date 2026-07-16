import {
  createProjectDocument,
  type CurristProjectData,
  type CurristProjectDocument,
} from "./project-document";

import { saveProjectToLocalStorage } from "./project-storage";
import { supabase } from "../lib/supabase";

export type CloudProjectSummary = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

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
  ): void {
    saveProjectToLocalStorage(project);
  }

  static async saveProjectToCloud(
    project: CurristProjectDocument,
    ownerId: string
  ): Promise<void> {
    const projectName =
      project.structures.find(
        (structure) => structure.type === "project"
      )?.name.trim() || "Untitled Project";

    const { error } = await supabase
      .from("projects")
      .upsert(
        {
          id: project.documentId,
          owner_id: ownerId,
          name: projectName,
          document: project,
          created_at: new Date(
            project.createdAt
          ).toISOString(),
          updated_at: new Date(
            project.updatedAt
          ).toISOString(),
        },
        {
          onConflict: "id",
        }
      );

    if (error) {
      throw new Error(error.message);
    }
  }

  static async getCloudProjects(): Promise<
    CloudProjectSummary[]
  > {
    const { data, error } = await supabase
      .from("projects")
      .select("id, name, created_at, updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map((project) => ({
      id: project.id,
      name: project.name,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    }));
  }

  static async getCloudProject(
    projectId: string
  ): Promise<CurristProjectDocument> {
    const { data, error } = await supabase
      .from("projects")
      .select("document")
      .eq("id", projectId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!data?.document) {
      throw new Error("Project document was not found.");
    }

    return data.document as CurristProjectDocument;
  }

  static async renameCloudProject(
    projectId: string,
    newName: string
  ): Promise<CurristProjectDocument> {
    const normalizedName = newName.trim();

    if (!normalizedName) {
      throw new Error("Project name cannot be empty.");
    }

    const project =
      await ProjectManager.getCloudProject(projectId);

    const updatedAt = Date.now();

    const renamedProject: CurristProjectDocument = {
      ...project,
      updatedAt,
      structures: project.structures.map((structure) =>
        structure.type === "project"
          ? {
              ...structure,
              name: normalizedName,
            }
          : structure
      ),
    };

    const { error } = await supabase
      .from("projects")
      .update({
        name: normalizedName,
        document: renamedProject,
        updated_at: new Date(updatedAt).toISOString(),
      })
      .eq("id", projectId);

    if (error) {
      throw new Error(error.message);
    }

    return renamedProject;
  }

  static async deleteCloudProject(
    projectId: string
  ): Promise<void> {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (error) {
      throw new Error(error.message);
    }
  }

  static buildProjectDocument(
    projectData: CurristProjectData,
    documentId: string | null,
    createdAt: number | null
  ): CurristProjectDocument {
    return createProjectDocument(
      projectData,
      documentId !== null && createdAt !== null
        ? {
            documentId,
            createdAt,
          }
        : undefined
    );
  }
}