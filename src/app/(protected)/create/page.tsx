"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/trpc/react';
import { toast } from 'sonner';
import useRefetch from '@/hooks/use-refetch';

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

const CreatePage = () => {

  const { register, handleSubmit, reset } = useForm<FormInput>();

  // calls the function from api/routes
  const createProject = api.project.createProject.useMutation();

  const refetch = useRefetch()

  function onSubmit(data: FormInput) {
    // window.alert(JSON.stringify(data, null, 2));
    createProject.mutate({
      githubUrl: data.repoUrl,
      githubToken: data.githubToken,
      name: data.projectName
    },{
      onSuccess: () => {
        toast.success('Project created successfully');
        refetch(); // this will call the function from hooks/use-project.ts and get the data from it to automatically refetch the new projects from the db.
        reset()
      },
      onError: () => {
        toast.error('Failed to create project')
      }
    })
    return true
  }

  return (
    <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
      <img src="/project.jpg" alt="Project" className="h-56 w-auto" />
      <div>
        <div className='font-semibold text-2xl'>
          <h1>Link Your Github Repository</h1>
          <p className='text-sm text-muted-foreground'>
            Enter the URL of your repository to link it to RepoSphere.
          </p>
        </div>

        <div className="h-4"></div>
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
          <Input {...register('projectName', { required: true })} placeholder='Project Name' required  />
          <div className="h-2"></div>
          <Input {...register('repoUrl', { required: true })} placeholder='Github URL' type='url' required  />
          <div className="h-2"></div>
          <Input {...register('githubToken')} placeholder='Github Token (Optional)' />
          <div className="h-4"></div>
          <Button type='submit' disabled={createProject.isPending}>
            Create Project
          </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
