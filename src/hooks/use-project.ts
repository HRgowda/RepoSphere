import { api } from '@/trpc/react'
import React from 'react'
import { useLocalStorage } from 'usehooks-ts'
 
// this is a hook that can be used anywhere in our application to get the list of projects from the database.
const useProject = () => {
  const { data: projects } = api.project.getProjects.useQuery();
  const [projectId, setProjectId] = useLocalStorage('repo_sphere', '');
  const project = projects?.find(project => project.id === projectId)
  return {
    projects,
    project,
    projectId,
    setProjectId
  }
}

export default useProject