import React, { useEffect, useState } from "react";

import Page from "../components/layout/Page";
import Typography from "../components/ui/Typography";
import ProjectList from "../components/common/ProjectList";
import SearchBar from "../components/ui/SearchBar";
import Activity from "../components/common/Activity";
import Explore from "../components/common/Explore";
import TextHighlight from "../components/ui/TextHighlight";
import Veil from "../components/ui/Veil";

import { config } from "../config";
import {
  ProjectSchema,
  type ProjectObject,
} from "@renaissance/shared";

export default function Dashboard(): React.JSX.Element {
  const [projects, setProjects] = useState<ProjectObject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        if (!config.serverUrl) {
          console.error("Server URL is not configured");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${config.serverUrl}/api/v1/user/data/project/search/mine`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch projects: ${response.status}`
          );
        }

        const result = await response.json();
        const projectsData =
          result.data?.projects || result.projects || [];

        const parsedProjects =
          ProjectSchema.array().parse(projectsData);

        setProjects(parsedProjects);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <Page
      alignment="default"
      className="flex gap-4"
    >
      <div className="mx-auto w-[62vw]">
        <div className="flex items-baseline justify-between">
          <div>
            <Typography variant="h1">
              Welcome
            </Typography>

            <Typography variant="h1">
              <TextHighlight
                color="bg-primary"
                intensity={60}
              >
                Shubham!
              </TextHighlight>
            </Typography>
          </div>

          <div className="flex flex-col gap-1 text-right">
            <Typography
              variant="muted"
              className="text-muted-foreground"
            >
              Words this week{" "}
              <span className="font-bold text-primary">
                253
              </span>
            </Typography>

            <Typography
              variant="muted"
              className="text-muted-foreground"
            >
              New chapters{" "}
              <span className="font-bold text-primary">
                2
              </span>
            </Typography>

            <Typography
              variant="muted"
              className="text-muted-foreground"
            >
              Branches created{" "}
              <span className="font-bold text-primary">
                5
              </span>
            </Typography>
          </div>
        </div>

        <SearchBar
          placeholder="Search projects..."
          size="md"
          onChange={() => {
            console.log("Hey");
          }}
          className="my-5"
        />

        {loading ? (
          <div className="my-5 flex items-center justify-center py-8">
            <Typography
              variant="muted"
              className="text-muted-foreground text-sm"
            >
              Loading projects...
            </Typography>
          </div>
        ) : (
          <ProjectList
            itemsPerPage={5}
            size="sm"
            className="my-5"
            projects={projects}
          />
        )}
      </div>

      <div className="mx-auto w-[25vw]">
        <Veil className="rounded-lg">
          <Explore className="mb-4" />
        </Veil>

        <Veil className="rounded-lg">
          <Activity className="max-h-[40vh] overflow-y-auto" />
        </Veil>
      </div>
    </Page>
  );
}