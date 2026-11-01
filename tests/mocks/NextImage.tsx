import type { ImgHTMLAttributes } from 'react'

type Props = ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean
    priority?: boolean
    unoptimized?: boolean
}

export default function NextImage({ fill, priority, unoptimized, ...props }: Props) {
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            {...props}
            alt={props.alt ?? ''}
            data-fill={fill ? 'true' : undefined}
            data-priority={priority ? 'true' : 'false'}
            data-unoptimized={unoptimized ? 'true' : undefined}
        />
    )
}
