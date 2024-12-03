"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

const CreatePage = () => {

  const { register, handleSubmit, reset } = useForm<FormInput>();

  function onSubmit(data: FormInput) {
    window.alert(JSON.stringify(data, null, 2));
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
          <Button type='submit'>
            Create Project
          </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
