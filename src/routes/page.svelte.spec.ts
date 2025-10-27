import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	it('should render the main heading', async () => {
		render(Page);

		const heading = page.getByRole('heading', { level: 1 });
		await expect.element(heading).toBeInTheDocument();
		await expect.element(heading).toHaveTextContent('Resume Builder');
	});

	it('should render the description paragraph', async () => {
		render(Page);

		const description = page.getByText(
			'Create professional resumes in minutes with our easy-to-use tool. Stand out to employers with a polished, well-structured resume.'
		);
		await expect.element(description).toBeInTheDocument();
	});

	it('should render the primary "Create Your Resume" button', async () => {
		render(Page);

		const createButton = page.getByRole('link', { name: 'Create Your Resume' });
		await expect.element(createButton).toBeInTheDocument();
		await expect.element(createButton).toHaveAttribute('href', '/canvas');
		await expect.element(createButton).not.toBeDisabled();
	});

	it('should render the "View Resumes" button', async () => {
		render(Page);

		const resumesButton = page.getByRole('link', { name: 'View Resumes' });
		await expect.element(resumesButton).toBeInTheDocument();
		await expect.element(resumesButton).toHaveAttribute('href', '/documents');
		await expect.element(resumesButton).not.toBeDisabled();
	});

	it('should render the footer with About Us link', async () => {
		render(Page);

		const aboutLink = page.getByRole('link', { name: 'About Us' });
		await expect.element(aboutLink).toBeInTheDocument();
		await expect.element(aboutLink).toHaveAttribute('href', '/about');

		const learnMoreText = page.getByText('Learn more about our platform');
		await expect.element(learnMoreText).toBeInTheDocument();
	});

	it('should have proper semantic structure', async () => {
		render(Page);

		// Check heading hierarchy
		const h1 = page.getByRole('heading', { level: 1 });
		await expect.element(h1).toBeInTheDocument();

		// Verify the page title is set
		await expect.element(page.getByText('Resume Builder')).toBeInTheDocument();
	});
});
